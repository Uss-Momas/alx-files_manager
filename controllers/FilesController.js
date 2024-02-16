import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.findUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { name, type } = req.body;
    const parentId = req.body.parentId || 0;
    const isPublic = req.body.isPublic || false;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !(['folder', 'file', 'image'].includes(type))) {
      return res.status(400).json({ error: 'Missing type' });
    }

    const { data } = req.body;
    if ((type === 'file' || type === 'image') && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId && parentId !== 0) {
      const parentFile = await dbClient.findFileById(parentId);
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileData = {
      userId: user._id,
      name,
      type,
      isPublic,
      parentId,
    };

    if (type === 'folder') {
      const newFile = await dbClient.createNewFile(fileData);
      return res.status(201).json(newFile);
    }

    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const fileId = uuidv4();
    const clearData = Buffer.from(data, 'base64');

    const localPath = path.join(folderPath, fileId);

    // creates the directory if not exists
    await fs.promises.mkdir(folderPath, { recursive: true });

    // write the content
    await fs.promises.writeFile(localPath, clearData);

    fileData.localPath = localPath;

    const result = await dbClient.createNewFile(fileData);

    return res.status(201).json(result);
  }

  static async getIndex(request, response) {
    const token = request.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    const user = await dbClient.findUserById(userId);

    if (!user) { return response.status(401).json({ error: 'Unauthorized' }); }

    let parentId = request.query.parentId || 0;
    if (parentId === '0') parentId = 0;

    let page = Number(request.query.page) || 0;
    if (Number.isNaN(page)) page = 0;

    if (parentId !== 0) {
      const folder = await dbClient.findFileById(parentId);

      if (!folder || folder.type !== 'folder') { return response.status(200).send([]); }
    }

    const limit = 20;
    const skip = page * limit;

    let pipeline;

    if (parentId === 0) {
      pipeline = [
        { $match: { userId: user._id } }, { $skip: skip }, { $limit: limit },
      ];
    } else {
      pipeline = [
        { $match: { userId: user._id, parentId } }, { $skip: skip }, { $limit: limit },
      ];
    }

    const files = await dbClient.getAllFilesWithAggregator(pipeline);

    const filesRefactored = files.map((file) => ({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    }));

    return response.status(200).json(filesRefactored);
  }

  static async getShow(request, response) {
    const token = request.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    const user = await dbClient.findUserById(userId);

    if (!user) { return response.status(401).json({ error: 'Unauthorized' }); }

    const fileId = request.params.id;

    const file = await dbClient.findFileByIdAndUserId(fileId, user._id);

    if (!file) { return response.status(404).json({ error: 'Not found' }); }

    return response.json({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }

  static async getFile(request, response) {
    const fileId = request.params.id;
    const file = await dbClient.findFileById(fileId);
    if (!file) {
      return response.status(404).json({ error: 'Not found' });
    }

    if (!file.isPublic) {
      const token = request.headers['x-token'];
      const userId = await redisClient.get(`auth_${token}`);
      const user = await dbClient.findUserById(userId);
      if (!user) {
        return response.status(404).json({ error: 'Not found' });
      }
      if (file.userId !== user._id.toString()) {
        return response.status(404).json({ error: 'Not found' });
      }
    }

    if (file.type === 'folder') {
      return response.status(400).json({ error: "A folder doesn't have content" });
    }

    try {
      await fs.promises.access(file.localPath, fs.constants.F_OK);
      /* eslint-disable-line */
    } catch (err) {
      return response.status(404).json({ error: 'Not found' });
    }

    const mimeType = mime.lookup(file.name);
    response.setHeader('Content-Type', mimeType);

    const contents = await fs.promises.readFile(file.localPath);
    return response.status(200).send(contents);
  }

  static async putPublish(request, response) {
    const token = request.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    const user = await dbClient.findUserById(userId);

    if (!user) { return response.status(401).json({ error: 'Unauthorized' }); }

    const fileId = request.params.id;

    const file = await dbClient.findFileByIdAndUserId(fileId, user._id);

    if (!file) { return response.status(404).json({ error: 'Not found' }); }

    const updateFile = await dbClient.updateFile(file._id, { isPublic: true });
    return response.json({
      id: updateFile._id,
      userId: updateFile.userId,
      name: updateFile.name,
      type: updateFile.type,
      isPublic: updateFile.isPublic,
      parentId: updateFile.parentId,
    });
  }

  static async putUnpublish(request, response) {
    const token = request.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    const user = await dbClient.findUserById(userId);

    if (!user) { return response.status(401).json({ error: 'Unauthorized' }); }

    const fileId = request.params.id;

    const file = await dbClient.findFileByIdAndUserId(fileId, user._id);

    if (!file) { return response.status(404).json({ error: 'Not found' }); }

    const updateFile = await dbClient.updateFile(file._id, { isPublic: false });
    return response.json({
      id: updateFile._id,
      userId: updateFile.userId,
      name: updateFile.name,
      type: updateFile.type,
      isPublic: updateFile.isPublic,
      parentId: updateFile.parentId,
    });
  }
}

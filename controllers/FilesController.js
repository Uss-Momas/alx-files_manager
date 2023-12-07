import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class FilesController {
  static async postUpload(request, response) {
    const token = request.headers['x-token'];
    const id = await redisClient.get(`auth_${token}`);
    const user = await dbClient.usersCollection.findOne({ _id: ObjectId(id) });

    if (!user) { return response.status(401).json({ error: 'Unauthorized' }); }

    const data = request.body;

    if (!data.name) { return response.status(400).json({ error: 'Missing name' }); }

    if (!data.type || !(['folder', 'file', 'image'].includes(data.type))) { return response.status(400).json({ error: 'Missing type' }); }

    if (!data.data && data.type !== 'folder') { return response.status(400).json({ error: 'Missing data' }); }

    if (data.parentId && data.parentId !== '0') {
      const parentFile = await dbClient.filesCollection.findOne({ _id: ObjectId(data.parentId) });
      if (!parentFile) {
        return response.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return response.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const isPublic = data.isPublic || false;

    const fileData = {
      userId: user._id,
      name: data.name,
      type: data.type,
      isPublic,
      parentId: data.parentId || 0,
    };

    if (data.type === 'folder') {
      await dbClient.filesCollection.insertOne(fileData);
      return response.status(201).json({
        id: fileData._id,
        userId: fileData.userId,
        name: fileData.name,
        type: fileData.type,
        isPublic: fileData.isPublic,
        parentId: fileData.parentId,
      });
    }
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const fileId = uuidv4();
    const clearData = Buffer.from(data.data, 'base64');

    const localPath = path.join(folderPath, fileId);

    // creates the directory if not exists
    await fs.promises.mkdir(folderPath, { recursive: true });

    // write the content
    await fs.promises.writeFile(localPath, clearData);

    fileData.localPath = localPath;

    await dbClient.filesCollection.insertOne(fileData);

    return response.status(201).json({
      id: fileData._id,
      userId: fileData.userId,
      name: fileData.name,
      type: fileData.type,
      isPublic: fileData.isPublic,
      parentId: fileData.parentId,
    });
  }

  static async getShow(request, response) {
    const token = request.headers['x-token'];
    const id = await redisClient.get(`auth_${token}`);

    const user = await dbClient.usersCollection.findOne({ _id: ObjectId(id) });

    console.log(request.params.id);

    if (!user) { return response.status(401).json({ error: 'Unauthorized' }); }

    let fileId = request.params.id;
    try {
      fileId = ObjectId(fileId);
    } catch (err) {
      return response.status(404).json({ error: 'Not Found' });
    }
    const file = await dbClient.filesCollection.findOne(
      { _id: ObjectId(fileId), userId: user._id },
    );

    if (!file) { return response.status(404).json({ error: 'Not Found' }); }

    return response.status(200).json({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }

  static async getIndex(request, response) {
    const token = request.headers['x-token'];
    const id = await redisClient.get(`auth_${token}`);

    const user = await dbClient.usersCollection.findOne({ _id: ObjectId(id) });

    if (!user) { return response.status(401).json({ error: 'Unauthorized' }); }

    const parentId = request.query.parentId || 0;
    // parseInt(str_number, base), base can be 2, 10, 16...
    const page = parseInt(request.query.page, 10) || 0;

    const limit = 20;
    const skip = page * limit;

    const pipeline = [
      { $match: { userId: user._id, parentId } }, { $limit: limit }, { $skip: skip },
    ];

    // const files = await dbClient.filesCollection.find({userId: user._id}).toArray();
    const files = await dbClient.filesCollection.aggregate(pipeline).toArray();

    // return response.status(200).json({});

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
}

module.exports = FilesController;

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
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
}

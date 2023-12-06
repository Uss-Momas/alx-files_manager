import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const authorization = req.headers.authorization || '';

    const base64Token = authorization.split(' ')[1];

    if (!base64Token) { return res.status(401).json({ error: 'Unauthorized' }); }

    const decoded = Buffer.from(base64Token, 'base64').toString('utf-8');

    const [email, password] = decoded.split(':');
    if (!email || !password) return res.status(401).json({ error: 'Unauthorized' });

    const hashedPwd = sha1(password);

    const result = await dbClient.usersCollection.findOne({ email, password: hashedPwd });
    if (!result) return res.status(401).json({ error: 'Unauthorized' });
    const token = uuidv4();

    await redisClient.set(`auth_${token}`, result._id.toString(), 86400);

    return res.status(200).json({ token });
  }

  static getDisconnect(req, res) {
    return res.status(200).json({ test: 'test' });
  }
}

module.exports = AuthController;

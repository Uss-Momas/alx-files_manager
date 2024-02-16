import sha1 from 'sha1';
import decodeBase64 from '../utils/decodeBase64';
import dbClient from '../utils/db';
import generateAuthToken from '../utils/generateAuthToken';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const { headers } = req;
    if (!headers.authorization) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const authData = headers.authorization.split(' ');
    const base64Data = authData[1];
    const credentials = decodeBase64(base64Data);

    const [userName, userPassword] = credentials.split(':');
    const user = await dbClient.finduserByEmail(userName);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const hashedPwd = sha1(userPassword);
    if (hashedPwd !== user.password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = await generateAuthToken(user._id.toString());

    return res.json(token);
  }

  static async getDisconnect(req, res) {
    const { headers } = req;
    const token = headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(`auth_${token}`);
    return res.status(204).json();
  }
}

export default AuthController;

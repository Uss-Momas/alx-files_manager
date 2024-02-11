import decodeBase64 from "../utils/decodeBase64";
import dbClient from '../utils/db';
import generateAuthToken from "../utils/generateAuthToken";
import redisClient from "../utils/redis";

class AuthController {
  static async getConnect(req, res) {
    const headers = req.headers;
    if (!headers.authorization) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const authData = headers.authorization.split(" ");
    const base64Data = authData[1];
    const credentials = decodeBase64(base64Data);

    const user = await dbClient.finduserByEmail(credentials.split(':')[0]);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = await generateAuthToken(user._id.toString());

    return res.json(token);
  }

  static async getDisconnect(req, res) {
    const headers = req.headers;
    const token = headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const auth_token = await redisClient.get(`auth_${token}`);
    
    if (!auth_token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(`auth_${token}`);
    return res.json();
  }
}

export default AuthController;
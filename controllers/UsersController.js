import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    const data = req.body;
    if (!data.email) { return res.status(400).json({ error: 'Missing email' }); }
    if (!data.password) { return res.status(400).json({ error: 'Missing password' }); }
    const { email, password } = data;

    const user = await dbClient.finduserByEmail(email);

    if (user) { return res.status(400).json({ error: 'Already exist' }); }
    const hashedPwd = sha1(password);

    const newUser = await dbClient.createNewuser({ email, hashedPwd });
    return res.status(201).json(newUser);
  }

  static async getMe(req, res) {
    const { headers } = req;
    const token = headers['x-token'];
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

    return res.json({ id: user._id, email: user.email });
  }
}

export default UsersController;

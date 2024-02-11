import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static async getStatus(req, res) {
    return res.json({ 'redis': redisClient.isAlive(), 'db': dbClient.isAlive() });
  }

  static async getStats(req, res) {
    const nbUsers = await dbClient.nbUsers();
    const nbFiles = await dbClient.nbFiles();

    return res.json({'users': nbUsers, 'files': nbFiles});
  }
}

export default AppController;
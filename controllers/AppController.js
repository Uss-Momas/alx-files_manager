const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AppController {
    static getStatus(req, res) {
        res.send({ "redis": redisClient.isAlive(), "db": dbClient.isAlive() });
    }

    static async getStats(req, res) {
        const users = await dbClient.nbUsers();
        const files = await dbClient.nbFiles();
        res.send({ "users": users, "files": files });
    }
}

module.exports = AppController;
import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.isClientConnected = true;
    this.client = createClient()
      .on('error', (err) => {
        console.log('Error connecting to Redis', err);
        this.isClientConnected = false;
      })
      .on('ready', () => {
        this.isClientConnected = true;
      });

    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  isAlive() {
    return this.isClientConnected;
  }

  async get(key) {
    /* eslint-disable  no-unused-vars */
    const value = await this.getAsync(key).then((response) => response).catch((err) => { });
    return value;
  }

  async set(key, value, duration) {
    /* eslint-disable  no-unused-vars */
    await this.setAsync(key, value)
      .then((response) => {
      })
      .catch((err) => { });
    this.client.expire(key, duration);
  }

  async del(key) {
    await this.delAsync(key)
      .then(() => { console.log('Deleted with success'); })
      .catch((err) => { console.log(err); });
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;

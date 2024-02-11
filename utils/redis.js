import { createClient } from "redis";
const util = require('util');

class RedisClient {
    constructor () {
        this.client = createClient().on('error', (e) => {
            console.log(e.message);
            this.isConnected = false;
        }).on('ready', () => {
            this.isConnected = true;
        });

        this.get = util.promisify(this.client.get).bind(this.client);
    }

    isAlive() {
        return this.client.connected;
    }

    async get(key) {
        const value = this.client.get(key);
        return value;
    }

    async set(key, value, duration) {
        await this.client.set(key, value, 'EX', duration);
    }

    async del(key) {
        await this.client.del(key);
    }
}

export default new RedisClient();
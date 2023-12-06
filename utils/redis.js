import { createClient } from "redis";
import { promisify } from 'util';

class RedisClient {

    #client;
    #get;

    constructor() {
        this.isClientConnected = true;
        this.#client = createClient()
            .on('error', (err) => {
                console.log('Error connecting to Redis', err);
                this.isClientConnected = false;
            })
            .on('ready', () => {
                // console.log('Redis client connected');
                this.isClientConnected = true;
            })


        this.#get = promisify(this.#client.get).bind(this.#client);
        this.setAsync = promisify(this.#client.set).bind(this.#client);
        this.delAsync = promisify(this.#client.del).bind(this.#client);
    }

    isAlive() {
        return this.isClientConnected;
    }

    async get(key) {
        return await this.#get(key).then((response) => response).catch((err) => { });
    }

    async set(key, value, duration) {
        await this.setAsync(key, value)
            .then((response) => {
                // console.log('Created with success');
            })
            .catch((err) => { console.log(err); });
        this.#client.expire(key, duration);
    }

    async del(key) {
        await this.delAsync(key)
            .then(() => { console.log('Deleted with success'); })
            .catch((err) => { console.log(err); });
    }



}

const redisClient = new RedisClient();

module.exports = redisClient;
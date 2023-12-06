const { MongoClient } = require("mongodb");

class DBClient {
    #dbHost = process.env.DB_HOST || 'localhost';
    #dbPort = process.env.DB_PORT || 27017;
    #dbName = process.env.DB_DATABASE || 'files_manager';
    #url = `mongodb://${this.#dbHost}:${this.#dbPort}/${this.#dbName}`;

    constructor() {
        this.client = new MongoClient(this.#url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        this.client.connect();
    }

    isAlive() {
        return this.client.isConnected();
    }
    async nbUsers() {
        return this.client.db(this.#dbName).collection("users").countDocuments();
    }

    async nbFiles() {
        return this.client.db(this.#dbName).collection("files").countDocuments();
    }
}

const dbClient = new DBClient();
module.exports = dbClient;
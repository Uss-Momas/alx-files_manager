const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    this.dbHost = process.env.DB_HOST || 'localhost';
    this.dbPort = process.env.DB_PORT || 27017;
    this.dbName = process.env.DB_DATABASE || 'files_manager';
    this.url = `mongodb://${this.dbHost}:${this.dbPort}/${this.dbName}`;

    this.client = new MongoClient(this.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.client.connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const db = this.client.db(this.dbName);
    const value = await db.collection('users').estimatedDocumentCount();
    return value;
  }

  async nbFiles() {
    const db = this.client.db(this.dbName);
    const value = await db.collection('files').estimatedDocumentCount();
    return value;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;

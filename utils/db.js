import { MongoClient } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  #url = `mongodb://${DB_HOST}:${DB_PORT}`;
  constructor() {
    this.client = new MongoClient(this.#url, { useUnifiedTopology: true });
    this.client.connect();
    this.db = this.client.db(DB_DATABASE);
  }

  isAlive() {
    return this.client.isConnected;
  }

  async nbUsers() {
    const count = await this.db.collection('users').countDocuments();
    return count;
  }

  async nbFiles() {
    const count = await this.db.collection('files').countDocuments();
    return count;
  }
}

export default new DBClient();
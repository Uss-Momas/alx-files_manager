import { MongoClient, ObjectId } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    const url = `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect((err, client) => {
      if (err) {
        console.log(err.message);
        this.db = false;
      } else {
        this.db = client.db;
      }
    });
  }

  isAlive() {
    // return this.client.isConnected;
    return !!this.db;
  }

  async nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }

  // find user by email
  async finduserByEmail(email) {
    const user = await this.client.db().collection('users').findOne({ email });
    return user;
  }

  // find user by Id
  async findUserById(id) {
    const user = await this.client.db().collection('users').findOne({ _id: new ObjectId(id) });
    return user;
  }

  async createNewuser({ email, hashedPwd }) {
    const result = await this.client.db().collection('users').insertOne({ email, password: hashedPwd });
    const newUser = await this.findUserById(result.insertedId);
    return { id: newUser._id, email: newUser.email };
  }

  async createNewFile(fileData) {
    const result = await this.client.db().collection('files').insertOne(fileData);
    const newFile = await this.findFileById(result.insertedId);
    return {
      id: newFile._id,
      userId: newFile.userId,
      name: newFile.name,
      type: newFile.type,
      isPublic: newFile.isPublic,
      parentId: newFile.parentId,
    };
  }

  async findFileById(id) {
    const file = await this.client.db().collection('files').findOne({ _id: new ObjectId(id) });
    return file;
  }
}

export default new DBClient();

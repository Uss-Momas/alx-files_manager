import sha1 from 'sha1';
import dbClient from '../utils/db';

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
}

export default UsersController;

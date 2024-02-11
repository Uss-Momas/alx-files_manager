import express from 'express';
import UsersController from '../controllers/UsersController';

const userRoutes = express.Router();

userRoutes.post('/users', async (req, res) => UsersController.postNew(req, res));

export default userRoutes;

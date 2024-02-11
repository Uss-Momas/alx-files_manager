import express from 'express';
import AuthController from '../controllers/AuthController';
import UsersController from '../controllers/UsersController';

const authRoutes = express.Router();

authRoutes.get('/connect', (req, res) => AuthController.getConnect(req, res));
authRoutes.get('/disconnect', (req, res) => AuthController.getDisconnect(req, res));
authRoutes.get('/users/me', (req, res) => UsersController.getMe(req, res));

export default authRoutes;

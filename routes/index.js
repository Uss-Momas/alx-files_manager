import express from 'express';
import AppController from '../controllers/AppController';
import userRoutes from './users.routes';
import authRoutes from './auth.routes';

const routes = express.Router();

routes.get('/status', async (req, res) => AppController.getStatus(req, res));

routes.get('/stats', async (req, res) => AppController.getStats(req, res));

routes.use(userRoutes);
routes.use(authRoutes);

export default routes;

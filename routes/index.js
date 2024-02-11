import express from 'express';
import AppController from '../controllers/AppController';

const routes = express.Router();

routes.get('/status', async (req, res) => AppController.getStatus(req, res));

routes.get('/stats', async (req, res) => AppController.getStats(req, res));

export default routes;

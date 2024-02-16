import express from 'express';
import FilesController from '../controllers/FilesController';

const filesRoutes = express.Router();

filesRoutes.post('/files', async (req, res) => FilesController.postUpload(req, res));
filesRoutes.get('/files/:id', async (req, res) => FilesController.getShow(req, res));
filesRoutes.get('/files', async (req, res) => FilesController.getIndex(req, res));
filesRoutes.put('/files/:id/publish', async (req, res) => FilesController.putPublish(req, res));
filesRoutes.put('/files/:id/unpublish', async (req, res) => FilesController.putUnpublish(req, res));

export default filesRoutes;

import express from 'express';
import FilesController from '../controllers/FilesController';

const  filesRoutes = express.Router();

filesRoutes.post('/files', async (req, res) => FilesController.postUpload(req, res));

export default filesRoutes;
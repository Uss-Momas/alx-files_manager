const express = require('express');
const AuthController = require('../controllers/AuthController');
const AppController = require('../controllers/AppController');
const FilesController = require('../controllers/FilesController');
const UsersController = require('../controllers/UsersController');

const router = express.Router();

router.use(express.json());

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// User routes
router.post('/users', UsersController.postNew);
router.get('/users/me', UsersController.getMe);

// Auth routes
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

// Files routes
router.post('/files', FilesController.postUpload);
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);

module.exports = router;

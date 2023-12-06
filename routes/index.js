const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('');
});

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// User routes
router.post('/users',  UsersController.postNew);


module.exports = router;
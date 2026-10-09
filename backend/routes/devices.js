const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { registerDevice, removeDevice } = require('../controllers/deviceController');

// All device routes require authentication
router.use(authenticate);

router.post('/', registerDevice);
router.delete('/', removeDevice);

module.exports = router;
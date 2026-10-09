const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { triggerSOS } = require('../controllers/sosController');

// All SOS routes require authentication
router.use(authenticate);

router.post('/trigger', triggerSOS);

module.exports = router;
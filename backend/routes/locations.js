const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { saveLocation, getLatestLocation, getLocationHistory } = require('../controllers/locationController');

// All location routes require authentication
router.use(authenticate);

router.post('/', saveLocation);
router.get('/latest', getLatestLocation);
router.get('/history', getLocationHistory);

module.exports = router;
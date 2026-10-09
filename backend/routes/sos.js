const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  triggerSOS,
  addLocationUpdate,
  cancelSOS,
  resolveSOS,
  getActiveSOS,
  getSOSHistory,
  getSOSById,
} = require('../controllers/sosController');

// All SOS routes require authentication
router.use(authenticate);

router.post('/trigger', triggerSOS);
router.get('/active', getActiveSOS);
router.get('/history', getSOSHistory);

router.post('/:id/location', addLocationUpdate);
router.post('/:id/cancel', cancelSOS);
router.post('/:id/resolve', resolveSOS);
router.get('/:id', getSOSById);

module.exports = router;
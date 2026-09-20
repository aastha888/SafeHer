const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getContacts, addContact, updateContact, deleteContact } = require('../controllers/contactController');

// All contact routes require authentication
router.use(authenticate);

router.get('/', getContacts);
router.post('/', addContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

module.exports = router;
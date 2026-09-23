const EmergencyContact = require('../models/EmergencyContact');

// @desc    Get all emergency contacts for the logged-in user
// @route   GET /api/contacts
const getContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ user_id: req.user.id }).sort({ is_primary: -1, created_at: 1 });

    return res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.error('Get contacts error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching contacts',
    });
  }
};

// @desc    Add a new emergency contact
// @route   POST /api/contacts
const addContact = async (req, res) => {
  try {
    const { name, phone, relationship, is_primary } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required',
      });
    }

    // If this contact is marked primary, un-mark any existing primary contact
    if (is_primary) {
      await EmergencyContact.updateMany(
        { user_id: req.user.id, is_primary: true },
        { is_primary: false }
      );
    }

    const contact = await EmergencyContact.create({
      user_id: req.user.id,
      name,
      phone,
      relationship: relationship || '',
      is_primary: !!is_primary,
    });

    return res.status(201).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error('Add contact error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding contact',
    });
  }
};

// @desc    Update an emergency contact
// @route   PUT /api/contacts/:id
const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, relationship, is_primary } = req.body;

    const contact = await EmergencyContact.findOne({ _id: id, user_id: req.user.id });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    if (is_primary) {
      await EmergencyContact.updateMany(
        { user_id: req.user.id, is_primary: true },
        { is_primary: false }
      );
    }

    if (name !== undefined) contact.name = name;
    if (phone !== undefined) contact.phone = phone;
    if (relationship !== undefined) contact.relationship = relationship;
    if (is_primary !== undefined) contact.is_primary = is_primary;

    await contact.save();

    return res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error('Update contact error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating contact',
    });
  }
};

// @desc    Delete an emergency contact
// @route   DELETE /api/contacts/:id
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await EmergencyContact.findOneAndDelete({ _id: id, user_id: req.user.id });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    console.error('Delete contact error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting contact',
    });
  }
};

module.exports = { getContacts, addContact, updateContact, deleteContact };
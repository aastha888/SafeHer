const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Contact phone number is required'],
    trim: true,
  },
  relationship: {
    type: String,
    trim: true,
    default: '',
  },
  is_primary: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

// Index for faster lookups of a user's contacts
emergencyContactSchema.index({ user_id: 1 });

const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);

module.exports = EmergencyContact;
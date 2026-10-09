const mongoose = require('mongoose');

// Accepts +919876543210 or 9876543210 (8-15 digits, optional leading +)
const PHONE_REGEX = /^\+?\d{8,15}$/;

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
    // Remove spaces and dashes before validating and saving
    set: (v) => (typeof v === 'string' ? v.replace(/[\s-]/g, '') : v),
    validate: {
      validator: (v) => PHONE_REGEX.test(v),
      message: 'Phone number must be 8-15 digits, optionally starting with +',
    },
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

// One user cannot save the same phone number twice
emergencyContactSchema.index({ user_id: 1, phone: 1 }, { unique: true });

const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);

module.exports = EmergencyContact;
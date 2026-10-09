const mongoose = require('mongoose');

// One entry per emergency contact we tried to notify
const notificationSchema = new mongoose.Schema({
  contact_id: { type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyContact' },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  channel: { type: String, enum: ['sms', 'push'], default: 'sms' },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  provider_id: { type: String, default: null }, // Twilio message SID or FCM message id
  error: { type: String, default: null },
  sent_at: { type: Date, default: null },
}, { _id: false });

// Extra location points recorded while the alert is active
const trailPointSchema = new mongoose.Schema({
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  accuracy: { type: Number },
  recorded_at: { type: Date, default: Date.now },
}, { _id: false });

const sosAlertSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'resolved', 'false_alarm'],
    default: 'active',
  },
  trigger_type: {
    type: String,
    enum: ['button', 'voice', 'shake', 'auto'],
    default: 'button',
  },
  // Where the user was when she triggered SOS
  location: {
    latitude: { type: Number, required: [true, 'Latitude is required'], min: -90, max: 90 },
    longitude: { type: Number, required: [true, 'Longitude is required'], min: -180, max: 180 },
    accuracy: { type: Number },
  },
  location_trail: { type: [trailPointSchema], default: [] },
  message: { type: String, trim: true, maxlength: 300, default: '' },
  notifications: { type: [notificationSchema], default: [] },
  triggered_at: { type: Date, default: Date.now },
  cancelled_at: { type: Date, default: null },
  resolved_at: { type: Date, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

// Fast "history, newest first" lookups for one user
sosAlertSchema.index({ user_id: 1, triggered_at: -1 });

// Database-level guarantee: a user can have only ONE active alert at a time
sosAlertSchema.index(
  { user_id: 1 },
  { unique: true, partialFilterExpression: { status: 'active' }, name: 'one_active_alert_per_user' }
);

const SOSAlert = mongoose.model('SOSAlert', sosAlertSchema);

module.exports = SOSAlert;
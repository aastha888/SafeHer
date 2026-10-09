const mongoose = require('mongoose');

// One document per notification attempt (push or SMS).
// Recipients are stored masked, and the message text is not stored.
const notificationLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    sent_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    channel: {
      type: String,
      enum: ['push', 'sms'],
      required: true,
    },
    type: {
      type: String,
      enum: ['sos', 'test', 'other'],
      default: 'other',
    },
    recipient: {
      type: String,
    },
    status: {
      type: String,
      enum: ['sent', 'failed'],
      required: true,
    },
    error: {
      type: String,
    },
    provider_id: {
      type: String,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

// Delete log entries automatically after 90 days
notificationLogSchema.index({ created_at: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
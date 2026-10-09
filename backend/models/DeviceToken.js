const mongoose = require('mongoose');

// One document per phone that can receive push notifications.
// A user can have several phones. The same device token is stored only once.
const deviceTokenSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: [true, 'Device token is required'],
      unique: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ['android', 'ios'],
      default: 'android',
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);
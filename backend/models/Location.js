const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
  },
  accuracy: {
    type: Number, // meters
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// TTL index: auto-delete documents 30 days after their timestamp
locationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
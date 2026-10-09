const SOSAlert = require('../models/SOSAlert');
const EmergencyContact = require('../models/EmergencyContact');
const { notifyContacts } = require('../services/SOSNotificationService');
const TRIGGER_TYPES = ['button', 'voice', 'shake', 'auto'];

// Returns { latitude, longitude, accuracy } as numbers, or null if invalid
const parseCoords = ({ latitude, longitude, accuracy }) => {
  if (latitude === undefined || latitude === null || latitude === '') return null;
  if (longitude === undefined || longitude === null || longitude === '') return null;

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  const acc = Number(accuracy);
  return {
    latitude: lat,
    longitude: lng,
    accuracy: accuracy !== undefined && accuracy !== null && Number.isFinite(acc) ? acc : undefined,
  };
};

// @desc    Trigger an SOS alert
// @route   POST /api/sos/trigger
const triggerSOS = async (req, res) => {
  try {
    const { trigger_type, message } = req.body;

    const coords = parseCoords(req.body);
    if (!coords) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude (-90 to 90) and longitude (-180 to 180) are required',
      });
    }

    const type = trigger_type || 'button';
    if (!TRIGGER_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `trigger_type must be one of: ${TRIGGER_TYPES.join(', ')}`,
      });
    }

    // One active alert per user: return the existing one instead of creating another
    const existing = await SOSAlert.findOne({ user_id: req.user.id, status: 'active' });
    if (existing) {
      return res.status(200).json({
        success: true,
        already_active: true,
        message: 'You already have an active SOS alert',
        alert: existing,
      });
    }

    // Guardians = this user's emergency contacts (primary first)
    const contacts = await EmergencyContact.find({ user_id: req.user.id })
      .sort({ is_primary: -1, created_at: 1 });

    let alert;
    try {
      alert = await SOSAlert.create({
        user_id: req.user.id,
        trigger_type: type,
        location: coords,
        message: message || '',
        // One "pending" entry per contact; Phase 4 fills in the SMS results
        notifications: contacts.map((c) => ({
          contact_id: c._id,
          name: c.name,
          phone: c.phone,
          channel: 'sms',
          status: 'pending',
        })),
      });
    } catch (error) {
      // Two requests arrived at the same moment: the database index blocked the second one
      if (error.code === 11000) {
        const active = await SOSAlert.findOne({ user_id: req.user.id, status: 'active' });
        return res.status(200).json({
          success: true,
          already_active: true,
          message: 'You already have an active SOS alert',
          alert: active,
        });
      }
      if (error.name === 'ValidationError') {
        const msg = Object.values(error.errors).map((e) => e.message).join(', ');
        return res.status(400).json({ success: false, message: msg });
      }
      throw error;
    }

        // Send SMS in the background; the response below does not wait for it
    if (alert.notifications.length > 0) {
      notifyContacts(alert._id).catch((err) =>
        console.error('Notify contacts error:', err.message)
      );
    }
    
    return res.status(201).json({
      success: true,
      already_active: false,
      message: contacts.length > 0
        ? 'SOS alert created'
        : 'SOS alert created, but you have no emergency contacts to notify',
      contacts_to_notify: contacts.length,
      alert,
    });
  } catch (error) {
    console.error('Trigger SOS error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while triggering SOS',
    });
  }
};

module.exports = { triggerSOS };
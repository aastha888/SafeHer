const mongoose = require('mongoose');
const SOSAlert = require('../models/SOSAlert');
const EmergencyContact = require('../models/EmergencyContact');
const { notifyContacts } = require('../services/SOSNotificationService');

const TRIGGER_TYPES = ['button', 'voice', 'shake', 'auto'];
const CLOSE_OUTCOMES = ['resolved', 'false_alarm'];
const HISTORY_STATUSES = ['active', 'cancelled', 'resolved', 'false_alarm'];
const MAX_TRAIL_POINTS = 500; // keeps one alert document from growing forever

// ---------- helpers ----------

// Returns { latitude, longitude, accuracy } as numbers, or null if invalid
const parseCoords = ({ latitude, longitude, accuracy }) => {
  if (latitude === undefined || latitude === null || latitude === '') return null;
  if (longitude === undefined || longitude === null || longitude === '') return null;

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  const coords = { latitude: lat, longitude: lng };
  const acc = Number(accuracy);
  if (accuracy !== undefined && accuracy !== null && Number.isFinite(acc)) {
    coords.accuracy = acc;
  }
  return coords;
};

const notFound = (res) =>
  res.status(404).json({ success: false, message: 'SOS alert not found' });

// Used when an "active alert only" update matched nothing:
// the alert either is not this user's (404) or is already closed (409)
const explainMissing = async (req, res) => {
  const exists = await SOSAlert.exists({ _id: req.params.id, user_id: req.user.id });
  if (!exists) return notFound(res);
  return res.status(409).json({
    success: false,
    message: 'This SOS alert is no longer active',
  });
};

// Moves an ACTIVE alert owned by this user to a closed status
const closeAlert = async (req, res, newStatus, timeField, successMessage) => {
  const alert = await SOSAlert.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user.id, status: 'active' },
    { $set: { status: newStatus, [timeField]: new Date() } },
    { new: true }
  );
  if (!alert) return explainMissing(req, res);
  return res.status(200).json({ success: true, message: successMessage, alert });
};

// ---------- trigger ----------

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

// ---------- live location ----------

// @desc    Add a location point to an active alert
// @route   POST /api/sos/:id/location
const addLocationUpdate = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

    const coords = parseCoords(req.body);
    if (!coords) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude (-90 to 90) and longitude (-180 to 180) are required',
      });
    }

    const point = { ...coords, recorded_at: new Date() };

    const alert = await SOSAlert.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id, status: 'active' },
      { $push: { location_trail: { $each: [point], $slice: -MAX_TRAIL_POINTS } } },
      { new: true }
    );
    if (!alert) return explainMissing(req, res);

    return res.status(200).json({
      success: true,
      trail_points: alert.location_trail.length,
      latest: point,
    });
  } catch (error) {
    console.error('Add SOS location error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating SOS location',
    });
  }
};

// ---------- cancel / resolve ----------

// @desc    Cancel an active alert (accidental trigger)
// @route   POST /api/sos/:id/cancel
const cancelSOS = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
    return await closeAlert(req, res, 'cancelled', 'cancelled_at', 'SOS alert cancelled');
  } catch (error) {
    console.error('Cancel SOS error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error while cancelling SOS' });
  }
};

// @desc    Close an active alert as resolved or false_alarm
// @route   POST /api/sos/:id/resolve   body: { "outcome": "resolved" | "false_alarm" }
const resolveSOS = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

    const outcome = req.body.outcome || 'resolved';
    if (!CLOSE_OUTCOMES.includes(outcome)) {
      return res.status(400).json({
        success: false,
        message: `outcome must be one of: ${CLOSE_OUTCOMES.join(', ')}`,
      });
    }

    return await closeAlert(req, res, outcome, 'resolved_at', `SOS alert marked as ${outcome}`);
  } catch (error) {
    console.error('Resolve SOS error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error while resolving SOS' });
  }
};

// ---------- reading alerts ----------

// @desc    Get the user's current active alert (alert is null when there is none)
// @route   GET /api/sos/active
const getActiveSOS = async (req, res) => {
  try {
    const alert = await SOSAlert.findOne({ user_id: req.user.id, status: 'active' });
    return res.status(200).json({ success: true, alert: alert || null });
  } catch (error) {
    console.error('Get active SOS error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error while fetching active SOS' });
  }
};

// @desc    Past alerts, newest first, paginated
// @route   GET /api/sos/history?page=1&limit=10&status=resolved
const getSOSHistory = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    const filter = { user_id: req.user.id };
    if (req.query.status) {
      if (!HISTORY_STATUSES.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: `status must be one of: ${HISTORY_STATUSES.join(', ')}`,
        });
      }
      filter.status = req.query.status;
    }

    const [alerts, total] = await Promise.all([
      SOSAlert.find(filter)
        .select('-location_trail') // keep the list light; use GET /:id for the full trail
        .sort({ triggered_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      SOSAlert.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      alerts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('SOS history error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error while fetching SOS history' });
  }
};

// @desc    One alert with its trail and notification results
// @route   GET /api/sos/:id
const getSOSById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

    const alert = await SOSAlert.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!alert) return notFound(res);

    return res.status(200).json({ success: true, alert });
  } catch (error) {
    console.error('Get SOS error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error while fetching SOS alert' });
  }
};

module.exports = {
  triggerSOS,
  addLocationUpdate,
  cancelSOS,
  resolveSOS,
  getActiveSOS,
  getSOSHistory,
  getSOSById,
};
const Location = require('../models/Location');

// @desc    Save current location
// @route   POST /api/locations
const saveLocation = async (req, res) => {
  try {
    const { latitude, longitude, accuracy } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const location = await Location.create({
      user_id: req.user.id,
      latitude,
      longitude,
      accuracy,
    });

    return res.status(201).json({
      success: true,
      location,
    });
  } catch (error) {
    console.error('Save location error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while saving location',
    });
  }
};

// @desc    Get most recent location
// @route   GET /api/locations/latest
const getLatestLocation = async (req, res) => {
  try {
    const location = await Location.findOne({ user_id: req.user.id }).sort({ timestamp: -1 });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'No location data found',
      });
    }

    return res.status(200).json({
      success: true,
      location,
    });
  } catch (error) {
    console.error('Get latest location error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching latest location',
    });
  }
};

// @desc    Get location history from the past X hours (default 24), paginated
// @route   GET /api/locations/history?hours=24&page=1
const getLocationHistory = async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const locations = await Location.find({
      user_id: req.user.id,
      timestamp: { $gte: cutoffTime },
    })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Location.countDocuments({
      user_id: req.user.id,
      timestamp: { $gte: cutoffTime },
    });

    return res.status(200).json({
      success: true,
      locations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get location history error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching location history',
    });
  }
};

module.exports = { saveLocation, getLatestLocation, getLocationHistory };
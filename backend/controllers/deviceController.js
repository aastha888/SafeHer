const DeviceToken = require('../models/DeviceToken');

// @desc    Register (or update) the push token of the logged-in user's phone
// @route   POST /api/devices
const registerDevice = async (req, res) => {
  try {
    const { token, platform } = req.body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Device token is required',
      });
    }

    if (platform !== undefined && !['android', 'ios'].includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Platform must be android or ios',
      });
    }

    // One record per token. If the same phone is used by another account later,
    // the token moves to the newest user.
    const update = { user_id: req.user.id };
    if (platform) {
      update.platform = platform;
    }

    const device = await DeviceToken.findOneAndUpdate(
      { token: token.trim() },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    return res.status(201).json({
      success: true,
      device,
    });
  } catch (error) {
    console.error('Register device error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while registering device',
    });
  }
};

// @desc    Remove a phone's push token (for example when the user logs out)
// @route   DELETE /api/devices
const removeDevice = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Device token is required',
      });
    }

    // Only the owner of a token can remove it
    await DeviceToken.deleteOne({ token: token.trim(), user_id: req.user.id });

    return res.json({
      success: true,
      message: 'Device removed',
    });
  } catch (error) {
    console.error('Remove device error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while removing device',
    });
  }
};

module.exports = { registerDevice, removeDevice };
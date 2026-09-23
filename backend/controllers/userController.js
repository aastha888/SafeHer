const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact');

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: user.getPublicData(),
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
    });
  }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { full_name, phone, profile_photo_url, dob } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Only allow updating these specific fields — email is intentionally excluded
    if (full_name !== undefined) user.full_name = full_name;
    if (phone !== undefined) user.phone = phone;
    if (profile_photo_url !== undefined) user.profile_photo_url = profile_photo_url;
    if (dob !== undefined) user.dob = dob;

    await user.save();

    return res.status(200).json({
      success: true,
      user: user.getPublicData(),
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
    });
  }
};

// @desc    Delete logged-in user's account (and related data)
// @route   DELETE /api/users/account
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete related data first
    await EmergencyContact.deleteMany({ user_id: req.user.id });

    // Delete the user
    await User.findByIdAndDelete(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Account and all related data deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting account',
    });
  }
};

module.exports = { getProfile, updateProfile, deleteAccount };
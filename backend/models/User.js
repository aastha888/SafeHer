const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  password_hash: {
    type: String,
    required: [true, 'Password is required'],
  },
  full_name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  dob: {
    type: Date,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  profile_photo_url: {
    type: String,
    default: '',
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

// Index email and phone for faster lookups
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password_hash')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password_hash);
};

// Return public-safe user data (no password)
userSchema.methods.getPublicData = function () {
  return {
    id: this._id,
    email: this.email,
    phone: this.phone,
    full_name: this.full_name,
    dob: this.dob,
    role: this.role,
    profile_photo_url: this.profile_photo_url,
    created_at: this.created_at,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
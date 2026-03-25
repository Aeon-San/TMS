import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  username: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  profilePic: {
    type: String,
    default: '',
  },
  profilePicPublicId: {
    type: String,
    default: null,
  },
  preferences: {
    darkMode: {
      type: Boolean,
      default: false,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    deadlineReminders: {
      type: Boolean,
      default: true,
    },
    assignmentNotifications: {
      type: Boolean,
      default: true,
    },
    productUpdates: {
      type: Boolean,
      default: false,
    },
  },
  resetPasswordToken: {
    type: String,
    default: null,
    select: false,
  },
  resetPasswordExpiresAt: {
    type: Date,
    default: null,
    select: false,
  },
  sessionVersion: {
    type: Number,
    default: 0,
    select: false,
  },
  sessionExpiresAt: {
    type: Date,
    default: null,
    select: false,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
  lastActiveAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true, sparse: true });

const User = mongoose.model('User', userSchema);
export default User;

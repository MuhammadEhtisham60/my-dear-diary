import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false, // Do not return password by default
  },
  bio: {
    type: String,
    default: '',
    maxlength: 300,
  },
  avatar: {
    type: String,
    default: null,
  },
  timezone: {
    type: String,
    default: 'America/New_York',
  },
  dateFormat: {
    type: String,
    default: 'MMM dd, yyyy',
  },
  weekStart: {
    type: String,
    enum: ['Monday', 'Sunday'],
    default: 'Monday',
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'light',
  },
  resetOtpHash: {
    type: String,
    select: false,
  },
  resetOtpExpires: {
    type: Date,
    select: false,
  },
  resetOtpAttempts: {
    type: Number,
    default: 0,
    select: false,
  },
}, {
  timestamps: true,
});

// Hash password whenever it changes
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Never expose password; expose `id` like the frontend expects
UserSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.resetOtpHash;
    delete ret.resetOtpExpires;
    delete ret.resetOtpAttempts;
    return ret;
  },
});

export default mongoose.model('User', UserSchema);

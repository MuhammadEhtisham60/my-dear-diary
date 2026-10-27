import mongoose from 'mongoose';

export const MOOD_IDS = [
  'happy', 'excited', 'calm', 'thoughtful',
  'sad', 'anxious', 'grateful', 'tired', 'angry', 'neutral',
];

const EntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  content: {
    type: String,
    default: '',
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true,
  },
  mood: {
    type: String,
    enum: MOOD_IDS,
    default: 'neutral',
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
    index: true,
  }],
  isFavorite: {
    type: Boolean,
    default: false,
    index: true,
  },
  isDraft: {
    type: Boolean,
    default: false,
  },
  wordCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Auto-calculate word count prior to saving
EntrySchema.pre('save', function (next) {
  if (this.isModified('content')) {
    this.wordCount = this.content ? this.content.trim().split(/\s+/).filter(Boolean).length : 0;
  }
  next();
});

// Compound indexes for fast user date range queries & search
EntrySchema.index({ userId: 1, date: -1 });
EntrySchema.index({ userId: 1, title: 'text', content: 'text' });

EntrySchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    ret.userId = ret.userId?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Entry', EntrySchema);

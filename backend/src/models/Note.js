import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
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
  description: {
    type: String,
    default: '',
  },
  date: {
    type: String, // YYYY-MM-DD (target date)
    required: true,
    index: true,
  },
  reminderTime: {
    type: String, // HH:mm format, e.g. "09:00"
    default: '09:00',
  },
  completed: {
    type: Boolean,
    default: false,
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
}, {
  timestamps: true,
});

NoteSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    ret.userId = ret.userId?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Note', NoteSchema);

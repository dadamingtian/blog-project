import mongoose from 'mongoose';

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    article: { type: Schema.Types.ObjectId, ref: 'Article', required: true, index: true },
    nickname: { type: String, required: true, trim: true, maxlength: 64 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    website: { type: String, default: '', trim: true, maxlength: 200 },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true }
  },
  { timestamps: true, versionKey: false }
);

commentSchema.index({ article: 1, status: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
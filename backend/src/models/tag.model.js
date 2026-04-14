import mongoose from 'mongoose';

const { Schema } = mongoose;

const tagSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 64 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 128 }
  },
  { timestamps: true, versionKey: false }
);

tagSchema.index({ name: 1 });

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;

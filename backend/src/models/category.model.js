import mongoose from 'mongoose';

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 64 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 128 },
    description: { type: String, default: '', trim: true, maxlength: 300 }
  },
  { timestamps: true, versionKey: false }
);

categorySchema.index({ name: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;

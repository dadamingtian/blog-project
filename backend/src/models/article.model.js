import mongoose from 'mongoose';

const { Schema } = mongoose;

const articleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 220 },
    summary: { type: String, default: '', trim: true, maxlength: 500 },
    content: { type: String, required: true, default: '' },
    coverImage: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    isTop: { type: Boolean, default: false, index: true },
    viewCount: { type: Number, default: 0, min: 0 },
    seoTitle: { type: String, default: '', trim: true, maxlength: 200 },
    seoDescription: { type: String, default: '', trim: true, maxlength: 300 },
    author: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    publishedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true, versionKey: false }
);

articleSchema.index({ status: 1, publishedAt: -1, createdAt: -1 });
articleSchema.index({ title: 'text', summary: 'text', content: 'text' });

const Article = mongoose.model('Article', articleSchema);

export default Article;

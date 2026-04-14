import mongoose from 'mongoose';

const { Schema } = mongoose;

const articleViewStatSchema = new Schema(
  {
    article: { type: Schema.Types.ObjectId, ref: 'Article', required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    views: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true, versionKey: false }
);

articleViewStatSchema.index({ article: 1, date: 1 }, { unique: true });

const ArticleViewStat = mongoose.model('ArticleViewStat', articleViewStatSchema);

export default ArticleViewStat;


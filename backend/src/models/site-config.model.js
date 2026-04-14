import mongoose from 'mongoose';

const { Schema } = mongoose;

const socialLinkSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    url: { type: String, required: true, trim: true, maxlength: 300 }
  },
  { _id: false }
);

const siteConfigSchema = new Schema(
  {
    siteName: { type: String, required: true, trim: true, maxlength: 100, default: 'Personal Blog' },
    siteDescription: { type: String, default: '', trim: true, maxlength: 300 },
    aboutContent: { type: String, default: '' },
    avatar: { type: String, default: '' },
    socialLinks: { type: [socialLinkSchema], default: [] },
    seoTitle: { type: String, default: '', trim: true, maxlength: 120 },
    seoDescription: { type: String, default: '', trim: true, maxlength: 300 }
  },
  { timestamps: true, versionKey: false }
);

const SiteConfig = mongoose.model('SiteConfig', siteConfigSchema);

export default SiteConfig;
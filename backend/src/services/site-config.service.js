import SiteConfig from '../models/site-config.model.js';

function toDTO(item) {
  return {
    id: item._id.toString(),
    siteName: item.siteName,
    siteDescription: item.siteDescription,
    aboutContent: item.aboutContent,
    avatar: item.avatar,
    socialLinks: item.socialLinks,
    seoTitle: item.seoTitle,
    seoDescription: item.seoDescription,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

async function getOrCreateConfig() {
  let config = await SiteConfig.findOne();

  if (!config) {
    config = await SiteConfig.create({
      siteName: 'Personal Blog',
      siteDescription: '',
      aboutContent: '',
      avatar: '',
      socialLinks: [],
      seoTitle: '',
      seoDescription: ''
    });
  }

  return config;
}

export async function getSiteConfig() {
  const config = await getOrCreateConfig();
  return toDTO(config);
}

export async function updateSiteConfig(payload) {
  const config = await getOrCreateConfig();

  if (typeof payload.siteName !== 'undefined') config.siteName = String(payload.siteName).trim();
  if (typeof payload.siteDescription !== 'undefined') config.siteDescription = String(payload.siteDescription).trim();
  if (typeof payload.aboutContent !== 'undefined') config.aboutContent = String(payload.aboutContent);
  if (typeof payload.avatar !== 'undefined') config.avatar = String(payload.avatar).trim();
  if (Array.isArray(payload.socialLinks)) {
    config.socialLinks = payload.socialLinks.map((item) => ({
      name: String(item.name || '').trim(),
      url: String(item.url || '').trim()
    }));
  }
  if (typeof payload.seoTitle !== 'undefined') config.seoTitle = String(payload.seoTitle).trim();
  if (typeof payload.seoDescription !== 'undefined') config.seoDescription = String(payload.seoDescription).trim();

  await config.save();

  return toDTO(config);
}
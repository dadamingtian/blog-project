import HttpError from './httpError.js';

function basicSlugify(text) {
  const normalized = String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return normalized.replace(/^-|-$/g, '');
}

export function ensureSlug(sourceSlug, fallbackText = '', fieldName = 'slug') {
  const initial = String(sourceSlug || '').trim();
  const slug = basicSlugify(initial || fallbackText);

  if (!slug) {
    throw new HttpError({ statusCode: 422, message: `${fieldName} is invalid or empty` });
  }

  return slug;
}

export async function ensureUniqueSlug({ model, slug, excludeId = null, maxAttempts = 30 }) {
  let candidate = slug;
  let attempt = 0;

  while (attempt < maxAttempts) {
    const query = { slug: candidate };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    // eslint-disable-next-line no-await-in-loop
    const exists = await model.exists(query);
    if (!exists) {
      return candidate;
    }

    attempt += 1;
    candidate = `${slug}-${attempt + 1}`;
  }

  throw new HttpError({ statusCode: 409, message: 'Unable to generate unique slug' });
}
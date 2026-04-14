#!/usr/bin/env node
import { randomUUID } from 'node:crypto';

const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:3000/api';
const ADMIN_USERNAME = process.env.SMOKE_ADMIN_USERNAME || process.env.ADMIN_INIT_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD || process.env.ADMIN_INIT_PASSWORD || 'Admin@123456';
const TIMEOUT_MS = Number.parseInt(process.env.SMOKE_TIMEOUT_MS || '12000', 10);

function logStep(message) {
  // eslint-disable-next-line no-console
  console.log(`\n[SMOKE] ${message}`);
}

function toQueryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.append(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

async function request(path, { method = 'GET', token = '', query, body, headers = {} } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${API_BASE_URL}${path}${toQueryString(query)}`;
    const reqHeaders = {
      ...headers
    };

    if (token) {
      reqHeaders.Authorization = `Bearer ${token}`;
    }

    let payloadBody = body;
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    if (body && !isFormData && typeof body === 'object') {
      reqHeaders['Content-Type'] = 'application/json';
      payloadBody = JSON.stringify(body);
    }

    const res = await fetch(url, {
      method,
      headers: reqHeaders,
      body: payloadBody,
      signal: controller.signal
    });

    const text = await res.text();
    let json;

    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText} - ${text || 'empty response'}`);
    }

    if (!json || typeof json.code === 'undefined') {
      throw new Error(`Unexpected response format: ${text || 'empty response'}`);
    }

    if (json.code !== 0) {
      throw new Error(`API error: ${json.message || 'unknown error'}`);
    }

    return json.data;
  } finally {
    clearTimeout(timeout);
  }
}

function createTinyPngBlob() {
  // 1x1 transparent PNG
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Zp6kAAAAASUVORK5CYII=';
  const buffer = Buffer.from(base64, 'base64');
  return new Blob([buffer], { type: 'image/png' });
}

async function run() {
  const unique = `smoke-${Date.now()}-${randomUUID().slice(0, 8)}`;

  let adminToken = '';
  let categoryId = '';
  let tagId = '';
  let articleId = '';
  let articleSlug = '';
  let commentId = '';

  try {
    logStep('1) Health check /api/health');
    await request('/health');

    logStep('2) Admin login /api/auth/login');
    const loginData = await request('/auth/login', {
      method: 'POST',
      body: {
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD
      }
    });
    adminToken = loginData.token;

    logStep('3) Auth chain check /api/auth/profile + /api/admin/access-check');
    await request('/auth/profile', { token: adminToken });
    await request('/admin/access-check', { token: adminToken });

    logStep('4) Site config read /api/site/config + /api/admin/site/config');
    await request('/site/config');
    await request('/admin/site/config', { token: adminToken });

    logStep('5) Create category/tag/article (published)');
    const category = await request('/admin/categories', {
      method: 'POST',
      token: adminToken,
      body: {
        name: `Smoke Category ${unique}`,
        description: 'smoke test category'
      }
    });
    categoryId = category.id;

    const tag = await request('/admin/tags', {
      method: 'POST',
      token: adminToken,
      body: {
        name: `Smoke Tag ${unique}`
      }
    });
    tagId = tag.id;

    const article = await request('/admin/articles', {
      method: 'POST',
      token: adminToken,
      body: {
        title: `Smoke Article ${unique}`,
        summary: 'stage9 smoke test article',
        content: '# smoke\n\nthis is smoke test article',
        status: 'published',
        category: categoryId,
        tags: [tagId],
        isTop: false
      }
    });
    articleId = article.id;
    articleSlug = article.slug;

    logStep('6) Verify article visibility for admin/public');
    await request('/admin/articles', { token: adminToken, query: { keyword: unique, page: 1, pageSize: 10 } });
    await request('/articles', { query: { keyword: unique, page: 1, pageSize: 10 } });
    await request(`/articles/${articleSlug}`);

    logStep('7) Comment flow: create -> approve -> public visible');
    await request('/comments', {
      method: 'POST',
      body: {
        article: articleId,
        nickname: `smoke-user-${unique}`,
        email: `smoke-${Date.now()}@example.com`,
        website: '',
        content: 'this is a smoke test comment'
      }
    });

    const adminComments = await request('/admin/comments', {
      token: adminToken,
      query: { page: 1, pageSize: 20, articleId }
    });

    const targetComment = (adminComments.items || []).find((item) => item.nickname === `smoke-user-${unique}`);
    if (!targetComment) {
      throw new Error('comment not found in admin list after creation');
    }
    commentId = targetComment.id;

    await request(`/admin/comments/${commentId}/status`, {
      method: 'PUT',
      token: adminToken,
      body: { status: 'approved' }
    });

    const publicComments = await request(`/comments/article/${articleId}`);
    const existsInPublic = (publicComments || []).some((item) => item.id === commentId);
    if (!existsInPublic) {
      throw new Error('approved comment was not returned by public endpoint');
    }

    logStep('8) Upload endpoint check /api/admin/upload/image');
    const formData = new FormData();
    formData.append('image', createTinyPngBlob(), `smoke-${Date.now()}.png`);
    await request('/admin/upload/image', {
      method: 'POST',
      token: adminToken,
      body: formData
    });

    logStep('9) Dashboard overview /api/admin/dashboard/overview');
    await request('/admin/dashboard/overview', { token: adminToken });

    logStep('PASS: smoke test completed');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`\n[SMOKE] FAIL: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (adminToken) {
      logStep('10) Cleanup smoke test data');
      try {
        if (commentId) {
          await request(`/admin/comments/${commentId}`, { method: 'DELETE', token: adminToken });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`[SMOKE] cleanup comment failed: ${error.message}`);
      }

      try {
        if (articleId) {
          await request(`/admin/articles/${articleId}`, { method: 'DELETE', token: adminToken });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`[SMOKE] cleanup article failed: ${error.message}`);
      }

      try {
        if (tagId) {
          await request(`/admin/tags/${tagId}`, { method: 'DELETE', token: adminToken });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`[SMOKE] cleanup tag failed: ${error.message}`);
      }

      try {
        if (categoryId) {
          await request(`/admin/categories/${categoryId}`, { method: 'DELETE', token: adminToken });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`[SMOKE] cleanup category failed: ${error.message}`);
      }
    }
  }
}

run();

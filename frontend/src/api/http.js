import axios from 'axios';
import { ADMIN_PROFILE_KEY, ADMIN_TOKEN_KEY } from '@/constants/auth';

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';
const apiOrigin = /^https?:\/\//i.test(apiBaseURL) ? new URL(apiBaseURL).origin : '';

const http = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  withCredentials: true
});

function clearAuthStorage() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_PROFILE_KEY);
}

function normalizeAssetUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('/')) {
    return apiOrigin ? `${apiOrigin}${url}` : url;
  }
  return url;
}

function normalizeResponseData(data) {
  if (!data || typeof data !== 'object') return;

  if (Array.isArray(data)) {
    data.forEach((item) => normalizeResponseData(item));
    return;
  }

  if (typeof data.coverImage === 'string') {
    data.coverImage = normalizeAssetUrl(data.coverImage);
  }
  if (typeof data.avatar === 'string') {
    data.avatar = normalizeAssetUrl(data.avatar);
  }

  Object.values(data).forEach((value) => {
    if (value && typeof value === 'object') {
      normalizeResponseData(value);
    }
  });
}

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => {
    const payload = response.data;

    if (payload && typeof payload.code !== 'undefined') {
      if (payload.code === 0) {
        normalizeResponseData(payload.data);
        return payload.data;
      }
      return Promise.reject(new Error(payload.message || 'Request failed'));
    }

    return payload;
  },
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      clearAuthStorage();

      const isAdminPage = window.location.pathname.startsWith('/admin');
      const isLoginPage = window.location.pathname.startsWith('/admin/login');

      if (isAdminPage && !isLoginPage) {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/admin/login?redirect=${redirect}`;
      }
    }

    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Network Error';

    return Promise.reject(new Error(message));
  }
);

export default http;

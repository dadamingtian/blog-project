import dotenv from 'dotenv';

dotenv.config();

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toList(value, fallback = []) {
  if (!value || !value.trim()) {
    return fallback;
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  port: toNumber(process.env.PORT, 3000),
  apiPrefix: process.env.API_PREFIX || '/api',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blog_project',
  jwtSecret: process.env.JWT_SECRET || 'change_this_jwt_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigins: toList(process.env.CORS_ORIGINS, ['http://localhost:5173', 'http://localhost:5174']),
  bodyLimit: process.env.BODY_LIMIT || '1mb',
  logFormat: process.env.LOG_FORMAT || 'dev',
  uploadDir: process.env.UPLOAD_DIR || 'src/uploads',
  publicServerUrl: process.env.PUBLIC_SERVER_URL || '',
  maxFileSize: toNumber(process.env.MAX_FILE_SIZE, 2 * 1024 * 1024),
  commentDefaultStatus: ['pending', 'approved'].includes(process.env.COMMENT_DEFAULT_STATUS)
    ? process.env.COMMENT_DEFAULT_STATUS
    : 'pending',
  adminInitUsername: process.env.ADMIN_INIT_USERNAME || 'admin',
  adminInitPassword: process.env.ADMIN_INIT_PASSWORD || 'Admin@123456',
  adminInitNickname: process.env.ADMIN_INIT_NICKNAME || 'Administrator'
});

export default env;

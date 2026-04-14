import cors from 'cors';
import { env } from '../config/index.js';

const LOCALHOST_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (env.corsOrigins.includes('*')) {
    return true;
  }

  if (env.corsOrigins.includes(origin)) {
    return true;
  }

  if (!env.isProduction && LOCALHOST_PATTERN.test(origin)) {
    return true;
  }

  return false;
}

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
};

export default cors(corsOptions);
import mongoose from 'mongoose';
import { env } from '../config/index.js';

export function getHealthStatus() {
  const dbConnected = mongoose.connection.readyState === 1;

  return {
    service: 'blog-project-backend',
    env: env.nodeEnv,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      connected: dbConnected,
      state: mongoose.connection.readyState
    }
  };
}

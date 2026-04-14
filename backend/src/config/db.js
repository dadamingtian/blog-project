import mongoose from 'mongoose';
import { env } from './index.js';
import logger from '../utils/logger.js';

let isConnectionEventsBound = false;

function bindConnectionEvents() {
  if (isConnectionEventsBound) {
    return;
  }

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
  });

  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error', error);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  isConnectionEventsBound = true;
}

export async function connectDatabase() {
  bindConnectionEvents();

  await mongoose.connect(env.mongodbUri, {
    maxPoolSize: 10,
    autoIndex: !env.isProduction
  });

  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}

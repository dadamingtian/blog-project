import express from 'express';
import helmet from 'helmet';

import { env, paths } from '../config/index.js';
import corsMiddleware from './corsOptions.js';
import requestLogger from './requestLogger.js';
import errorHandler from './errorHandler.js';
import notFoundHandler from './notFoundHandler.js';

export function registerCoreMiddlewares(app) {
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));
  app.use(corsMiddleware);
  app.use(requestLogger);
  app.use(express.json({ limit: env.bodyLimit }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(paths.uploadAbsDir));
}

export function registerErrorMiddlewares(app) {
  app.use(notFoundHandler);
  app.use(errorHandler);
}

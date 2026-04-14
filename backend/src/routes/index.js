import apiRouter from './api/index.js';
import { env } from '../config/index.js';
import { sendSuccess } from '../utils/response.js';

export function registerRoutes(app) {
  app.get(env.apiPrefix, (req, res) => {
    return sendSuccess(res, {
      data: {
        name: 'blog-project-api',
        version: '0.4.0'
      }
    });
  });

  app.use(env.apiPrefix, apiRouter);
}
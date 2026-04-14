import express from 'express';
import { registerCoreMiddlewares, registerErrorMiddlewares } from './middlewares/registerMiddlewares.js';
import { registerRoutes } from './routes/index.js';

function createApp() {
  const app = express();

  registerCoreMiddlewares(app);
  registerRoutes(app);
  registerErrorMiddlewares(app);

  return app;
}

const app = createApp();

export default app;

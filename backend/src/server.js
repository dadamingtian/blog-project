import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env, paths } from './config/index.js';
import { ensureDirectory } from './utils/fs.js';
import logger from './utils/logger.js';

async function bootstrap() {
  try {
    await ensureDirectory(paths.uploadAbsDir);
    await connectDatabase();

    app.listen(env.port, () => {
      logger.info(`Server started at http://localhost:${env.port}`);
      logger.info(`API prefix: ${env.apiPrefix}`);
      logger.info(`Uploads: ${paths.uploadAbsDir}`);
    });
  } catch (error) {
    logger.error('Server bootstrap failed', error);
    process.exit(1);
  }
}

bootstrap();

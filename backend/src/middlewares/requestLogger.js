import morgan from 'morgan';
import { env } from '../config/index.js';
import logger from '../utils/logger.js';

const requestLogger = morgan(env.logFormat, {
  stream: {
    write(message) {
      logger.info(message.trim());
    }
  }
});

export default requestLogger;

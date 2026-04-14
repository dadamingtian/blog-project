import path from 'node:path';
import { fileURLToPath } from 'node:url';
import env from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendRoot = path.resolve(__dirname, '../..');
const srcRoot = path.resolve(__dirname, '..');
const uploadAbsDir = path.resolve(backendRoot, env.uploadDir);

const paths = Object.freeze({
  backendRoot,
  srcRoot,
  uploadAbsDir
});

export default paths;

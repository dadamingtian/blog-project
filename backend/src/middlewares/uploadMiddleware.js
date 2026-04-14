import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { env, paths } from '../config/index.js';
import HttpError from '../utils/httpError.js';

const allowedImageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);

const mimeExtensionMap = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif']
]);

const imageUploadDir = path.join(paths.uploadAbsDir, 'images');
fs.mkdirSync(imageUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, imageUploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname) || mimeExtensionMap.get(file.mimetype) || '.bin';
    const safeExt = ext.toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;
    cb(null, filename);
  }
});

function imageFileFilter(req, file, cb) {
  if (allowedImageMimeTypes.has(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new HttpError({
    statusCode: 415,
    message: 'Only jpg, png, webp and gif files are allowed'
  }));
}

const uploadImageMiddleware = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: env.maxFileSize
  }
}).single('image');

export default uploadImageMiddleware;

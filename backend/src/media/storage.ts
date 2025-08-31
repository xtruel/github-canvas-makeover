import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { randomUUID } from 'crypto';

const baseDir = path.resolve(config.MEDIA_LOCAL_DIR);
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

export const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, baseDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, randomUUID() + ext);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * Math.max(config.MAX_IMAGE_MB, config.MAX_VIDEO_MB),
  },
});
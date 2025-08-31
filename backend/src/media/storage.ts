import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

// Ensure uploads directory exists
const ensureUploadDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), config.MEDIA_LOCAL_DIR);
    ensureUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (config.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${config.ALLOWED_IMAGE_TYPES.join(', ')}`));
  }
};

// File filter for videos
const videoFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (config.ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${config.ALLOWED_VIDEO_TYPES.join(', ')}`));
  }
};

// Image upload configuration
export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: config.MAX_IMAGE_SIZE_BYTES,
  },
});

// Video upload configuration
export const uploadVideo = multer({
  storage,
  fileFilter: videoFilter,
  limits: {
    fileSize: config.MAX_VIDEO_SIZE_BYTES,
  },
});
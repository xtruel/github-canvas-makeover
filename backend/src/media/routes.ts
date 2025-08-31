import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { upload } from './storage.js';
import { prisma } from '../prisma.js';
import { authRequired, adminOnly } from '../auth/middleware.js';
import { config } from '../config.js';

const router = Router();

router.post('/upload', authRequired, adminOnly, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const media = await prisma.media.create({
    data: {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.filename,
      url: `/media/${req.file.filename}`,
    },
  });
  res.status(201).json(media);
});

router.get('/', async (_req, res) => {
  const items = await prisma.media.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  res.json(items);
});

router.get('/:filename', async (req, res) => {
  const file = path.resolve(config.MEDIA_LOCAL_DIR, req.params.filename);
  if (!fs.existsSync(file)) return res.status(404).send('Not found');
  res.sendFile(file);
});

export default router;
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { requireAdmin, AuthRequest } from '../auth/authMiddleware.js';

export const uploadsPutRouter = Router();

const uploadDir = path.join(process.cwd(), 'backend', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

uploadsPutRouter.put('/uploads/:id', requireAdmin(), (req: AuthRequest, res) => {
  const id = req.params.id;
  const filePath = path.join(uploadDir, id);
  const chunks: Buffer[] = [];

  req.on('data', d => chunks.push(d));
  req.on('end', () => {
    fs.writeFileSync(filePath, Buffer.concat(chunks));
    res.status(200).end();
  });
});

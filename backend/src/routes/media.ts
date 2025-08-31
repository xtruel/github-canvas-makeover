import { Router } from 'express';
import { prisma } from '../prisma/client.js';
import { authRequired, requireAdmin, AuthRequest } from '../auth/authMiddleware.js';
import fs from 'fs';
import path from 'path';

export const mediaRouter = Router();

const uploadDir = path.join(process.cwd(), 'backend', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

function buildPresignRoute(pathBase: string, admin: boolean) {
  mediaRouter.post(pathBase + '/media/presign', admin ? requireAdmin() : authRequired(), async (req: AuthRequest, res) => {
    const { filename, mimeType, type } = req.body || {};
    if (!filename || !mimeType || !type) return res.status(400).json({ error: 'filename, mimeType, type required' });
    if (!['IMAGE','VIDEO'].includes(type)) return res.status(400).json({ error: 'invalid type' });

    const asset = await prisma.mediaAsset.create({ data: { type, mimeType, originalPath: '', originalUrl: '', status: 'PENDING' } });
    const filePath = path.join(uploadDir, asset.id);
    const publicUrl = `/uploads/${asset.id}`;
    const uploadUrl = `/uploads/${asset.id}`;
    res.json({ assetId: asset.id, uploadUrl, publicUrl });
  });
}

buildPresignRoute('/admin', true);
buildPresignRoute('', false);

mediaRouter.post('/admin/media/:id/finalize', requireAdmin(), finalizeHandler);
mediaRouter.post('/media/:id/finalize', authRequired(), finalizeHandler);

async function finalizeHandler(req: AuthRequest, res: any) {
  const { id } = req.params;
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return res.status(404).json({ error: 'not found' });

  const filePath = path.join(uploadDir, id);
  if (!fs.existsSync(filePath)) return res.status(400).json({ error: 'file missing' });

  const updated = await prisma.mediaAsset.update({ where: { id }, data: { status: 'READY', originalPath: filePath, originalUrl: `/uploads/${id}`, width: req.body?.width, height: req.body?.height } });
  res.json(updated);
}


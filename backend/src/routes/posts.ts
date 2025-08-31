import { Router } from 'express';
import { prisma } from '../prisma/client.js';
import { requireAdmin, AuthRequest } from '../auth/authMiddleware.js';

export const postsRouter = Router();

postsRouter.get('/posts', async (req, res) => {
  const limit = Math.min(parseInt(String(req.query.limit || '20')), 50);
  const cursor = req.query.cursor ? String(req.query.cursor) : undefined;

  const items = await prisma.communityPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    include: { media: true },
  });

  let nextCursor: string | null = null;
  if (items.length > limit) {
    const last = items.pop();
    nextCursor = last!.id;
  }
  res.json({ items, nextCursor });
});

postsRouter.post('/posts', requireAdmin(), async (req: AuthRequest, res) => {
  const { type, title, body, mediaId } = req.body || {};
  if (!type || !['TEXT','IMAGE','VIDEO'].includes(type)) return res.status(400).json({ error: 'invalid type' });
  if (!title) return res.status(400).json({ error: 'title required' });
  if (type === 'TEXT' && !body) return res.status(400).json({ error: 'body required for TEXT' });
  if ((type === 'IMAGE' || type === 'VIDEO') && !mediaId) return res.status(400).json({ error: 'mediaId required' });

  const post = await prisma.communityPost.create({ data: { userId: req.user!.id, type, title, body: body || null, mediaId: mediaId || null } });
  res.json(post);
});

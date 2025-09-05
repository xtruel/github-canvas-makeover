import { Router } from 'express';
import { prisma } from '../prisma/client.js';
import { requireAdmin } from '../auth/authMiddleware.js';
import slugify from 'slugify';

export const articlesRouter = Router();

articlesRouter.get('/articles', async (_req, res) => {
  const items = await prisma.article.findMany({ where: { status: 'PUBLISHED' }, orderBy: { publishedAt: 'desc' }, take: 20 });
  res.json(items);
});

// NEW: get single article by slug (only published)
articlesRouter.get('/articles/:slug', async (req, res) => {
  const { slug } = req.params;
  const item = await prisma.article.findUnique({ where: { slug } });
  if (!item || item.status !== 'PUBLISHED') return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// NEW: get comments for an article by slug (public)
articlesRouter.get('/articles/:slug/comments', async (req, res) => {
  const { slug } = req.params;
  const art = await prisma.article.findUnique({ where: { slug } });
  if (!art || art.status !== 'PUBLISHED') return res.status(404).json({ error: 'Not found' });
  const comments = await prisma.comment.findMany({ where: { articleId: art.id, status: 'APPROVED' }, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json(comments);
});

// NEW: post a comment to an article by slug (public)
articlesRouter.post('/articles/:slug/comments', async (req, res) => {
  const { slug } = req.params;
  const { authorName, body } = req.body || {};
  if (!authorName || !body) return res.status(400).json({ error: 'authorName and body required' });
  if (typeof authorName !== 'string' || typeof body !== 'string') return res.status(400).json({ error: 'Invalid payload' });
  const art = await prisma.article.findUnique({ where: { slug } });
  if (!art || art.status !== 'PUBLISHED') return res.status(404).json({ error: 'Not found' });
  const created = await prisma.comment.create({ data: { articleId: art.id, authorName: authorName.slice(0,80), body: body.slice(0,2000), status: 'PENDING' } });
  res.json(created);
});

// Admin moderation: list comments (default PENDING)
articlesRouter.get('/admin/comments', requireAdmin(), async (req, res) => {
  const status = (String(req.query.status || 'PENDING').toUpperCase());
  const allowed = ['PENDING','APPROVED','REJECTED'];
  const s = allowed.includes(status) ? status : 'PENDING';
  const items = await prisma.comment.findMany({
    where: { status: s },
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { article: { select: { id: true, title: true, slug: true } }, user: { select: { id: true } } },
  });
  res.json(items);
});

// Admin approve comment
articlesRouter.post('/admin/comments/:id/approve', requireAdmin(), async (req, res) => {
  const { id } = req.params;
  const updated = await prisma.comment.update({ where: { id }, data: { status: 'APPROVED' } });
  res.json(updated);
});

// Admin reject comment
articlesRouter.post('/admin/comments/:id/reject', requireAdmin(), async (req, res) => {
  const { id } = req.params;
  const updated = await prisma.comment.update({ where: { id }, data: { status: 'REJECTED' } });
  res.json(updated);
});

articlesRouter.post('/admin/articles', requireAdmin(), async (req, res) => {
  const { title, body, status, language, coverMediaId } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: 'title & body required' });

  const slugBase = slugify(title, { lower: true, strict: true }) || 'post';
  let slug = slugBase;
  let n = 1;
  while (await prisma.article.findUnique({ where: { slug } })) slug = `${slugBase}-${n++}`;

  const publishedAt = status === 'PUBLISHED' ? new Date() : null;
  const created = await prisma.article.create({ data: { title, body, slug, status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT', language: language || 'it', coverMediaId: coverMediaId || null, publishedAt } });
  res.json(created);
});

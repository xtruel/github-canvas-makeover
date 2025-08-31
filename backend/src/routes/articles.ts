import { Router } from 'express';
// import { prisma } from '../prisma/client.js';
import { requireAdmin } from '../auth/authMiddleware.js';
import slugify from 'slugify';

export const articlesRouter = Router();

articlesRouter.get('/articles', async (_req, res) => {
  const items = await prisma.article.findMany({ where: { status: 'PUBLISHED' }, orderBy: { publishedAt: 'desc' }, take: 20 });
  res.json(items);
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

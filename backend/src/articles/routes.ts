import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authRequired, adminOnly } from '../auth/middleware.js';

const router = Router();

// Public: list articles
router.get('/', async (_req, res) => {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
    include: { cover: true },
  });
  res.json(articles);
});

// Public: single article
router.get('/:id', async (req, res) => {
  const article = await prisma.article.findUnique({
    where: { id: req.params.id },
    include: { cover: true },
  });
  if (!article) return res.status(404).json({ error: 'Not found' });
  res.json(article);
});

// Admin: create
router.post('/', authRequired, adminOnly, async (req, res) => {
  const { title, body, coverId, published } = req.body ?? {};
  if (!title || !body) return res.status(400).json({ error: 'title and body required' });
  const article = await prisma.article.create({
    data: {
      title,
      body,
      published: Boolean(published),
      coverId: coverId || null,
    },
  });
  res.status(201).json(article);
});

// Admin: update
router.put('/:id', authRequired, adminOnly, async (req, res) => {
  const { title, body, coverId, published } = req.body ?? {};
  const article = await prisma.article.update({
    where: { id: req.params.id },
    data: { title, body, coverId: coverId || null, published: Boolean(published) },
  });
  res.json(article);
});

// Admin: delete
router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  await prisma.article.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

export default router;
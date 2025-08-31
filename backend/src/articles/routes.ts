import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { requireAuth, requireAdmin } from '../auth/middleware';

const router = Router();

// Article creation schema
const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  media: z.array(z.object({
    filename: z.string(),
    originalName: z.string(),
    mimetype: z.string(),
    size: z.number(),
    path: z.string(),
    uploadedAt: z.string(),
  })).optional().default([]),
  published: z.boolean().optional().default(false),
});

// Create article (admin only)
router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const validatedData = createArticleSchema.parse(req.body);
    
    const article = await prisma.article.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        mediaJson: JSON.stringify(validatedData.media),
        published: validatedData.published,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: {
        ...article,
        media: JSON.parse(article.mediaJson || '[]'),
      },
    });
  } catch (error) {
    console.error('Create article error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// Get all articles (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { published } = req.query;
    
    const where = published === 'true' ? { published: true } : {};
    
    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        mediaJson: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const articlesWithMedia = articles.map((article: any) => ({
      ...article,
      media: JSON.parse(article.mediaJson || '[]'),
    }));

    res.json({
      success: true,
      data: articlesWithMedia,
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Get single article by ID (public)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({
      success: true,
      data: {
        ...article,
        media: JSON.parse(article.mediaJson || '[]'),
      },
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

export default router;
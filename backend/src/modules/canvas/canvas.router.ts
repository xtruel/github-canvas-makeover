import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/prisma.js';

const router = Router();

// Zod schema for Canvas creation
const createCanvasSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters')
});

// POST /api/canvas - Create a new canvas
router.post('/', async (req, res, next) => {
  try {
    const validatedData = createCanvasSchema.parse(req.body);
    
    const canvas = await prisma.canvas.create({
      data: {
        name: validatedData.name
      }
    });
    
    res.status(201).json(canvas);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    next(error);
  }
});

// GET /api/canvas - List all canvases
router.get('/', async (req, res, next) => {
  try {
    const canvases = await prisma.canvas.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.status(200).json(canvases);
  } catch (error) {
    next(error);
  }
});

// GET /api/canvas/:id - Get a specific canvas by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const canvas = await prisma.canvas.findUnique({
      where: { id }
    });
    
    if (!canvas) {
      return res.status(404).json({ error: 'NotFound' });
    }
    
    res.status(200).json(canvas);
  } catch (error) {
    next(error);
  }
});

export { router as canvasRouter };
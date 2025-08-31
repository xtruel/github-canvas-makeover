import { Router } from 'express';
import { z } from 'zod';
// import { prisma } from '../../services/prisma.js';

const router = Router();

// Zod schema for Canvas creation
const createCanvasSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters')
});

// In-memory storage for demo purposes (replace with Prisma once available)
let canvases: any[] = [];
let nextId = 1;

// POST /api/canvas - Create a new canvas
router.post('/', async (req, res, next) => {
  try {
    const validatedData = createCanvasSchema.parse(req.body);
    
    // TODO: Replace with Prisma once network connectivity allows
    const canvas = {
      id: `canvas_${nextId++}`,
      name: validatedData.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    canvases.push(canvas);
    
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
    // TODO: Replace with Prisma once network connectivity allows
    const sortedCanvases = [...canvases].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    res.status(200).json(sortedCanvases);
  } catch (error) {
    next(error);
  }
});

// GET /api/canvas/:id - Get a specific canvas by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // TODO: Replace with Prisma once network connectivity allows
    const canvas = canvases.find(c => c.id === id);
    
    if (!canvas) {
      return res.status(404).json({ error: 'NotFound' });
    }
    
    res.status(200).json(canvas);
  } catch (error) {
    next(error);
  }
});

export { router as canvasRouter };
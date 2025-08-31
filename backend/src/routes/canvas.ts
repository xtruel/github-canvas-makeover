import { Router } from 'express';
import { prisma } from '../prisma/client.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';

export const canvasRouter = Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'backend', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configure multer for file uploads with size limits
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max (will be validated per type)
  },
  fileFilter: (req, file, cb) => {
    // Allowed MIME types
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`));
    }
  }
});

// Zod schemas for validation
const textPostSchema = z.object({
  type: z.literal('TEXT'),
  content: z.string().min(1, 'Content is required for text posts')
});

const mediaPostSchema = z.object({
  type: z.enum(['IMAGE', 'VIDEO'])
});

// POST /api/canvas/:id/post - Create a new post in a Canvas
canvasRouter.post('/api/canvas/:id/post', upload.single('file'), async (req, res) => {
  try {
    const canvasId = req.params.id;
    
    // Check if canvas exists
    const canvas = await prisma.canvas.findUnique({ where: { id: canvasId } });
    if (!canvas) {
      return res.status(404).json({ error: 'Canvas not found' });
    }

    const contentType = req.get('Content-Type') || '';
    
    if (contentType.includes('application/json')) {
      // Handle text post
      const validation = textPostSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid text post data', 
          details: validation.error.issues 
        });
      }

      const { content } = validation.data;
      
      const post = await prisma.post.create({
        data: {
          canvasId,
          type: 'TEXT',
          content,
          fileUrl: null
        }
      });

      res.status(201).json(post);
    } else if (contentType.includes('multipart/form-data')) {
      // Handle media post
      if (!req.file) {
        return res.status(400).json({ error: 'File is required for media posts' });
      }

      const validation = mediaPostSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid media post data', 
          details: validation.error.issues 
        });
      }

      const { type } = validation.data;
      
      // Validate file size based on type
      const fileSizeInMB = req.file.size / (1024 * 1024);
      if (type === 'IMAGE' && fileSizeInMB > 10) {
        // Delete the uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Image files must be under 10MB' });
      }
      if (type === 'VIDEO' && fileSizeInMB > 50) {
        // Delete the uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Video files must be under 50MB' });
      }

      // Generate public URL
      const fileUrl = `/uploads/${req.file.filename}`;

      const post = await prisma.post.create({
        data: {
          canvasId,
          type,
          content: null,
          fileUrl
        }
      });

      res.status(201).json(post);
    } else {
      return res.status(400).json({ 
        error: 'Content-Type must be application/json for text posts or multipart/form-data for media posts' 
      });
    }
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/canvas/:id/posts - Get all posts for a Canvas
canvasRouter.get('/api/canvas/:id/posts', async (req, res) => {
  try {
    const canvasId = req.params.id;
    
    // Check if canvas exists
    const canvas = await prisma.canvas.findUnique({ where: { id: canvasId } });
    if (!canvas) {
      return res.status(404).json({ error: 'Canvas not found' });
    }

    const posts = await prisma.post.findMany({
      where: { canvasId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper route: Create a canvas (for testing)
canvasRouter.post('/api/canvas', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const canvas = await prisma.canvas.create({
      data: { title, description: description || null }
    });

    res.status(201).json(canvas);
  } catch (error) {
    console.error('Error creating canvas:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper route: List all canvases (for testing)
canvasRouter.get('/api/canvas', async (req, res) => {
  try {
    const canvases = await prisma.canvas.findMany({
      include: {
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 5 // Include latest 5 posts for preview
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(canvases);
  } catch (error) {
    console.error('Error fetching canvases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
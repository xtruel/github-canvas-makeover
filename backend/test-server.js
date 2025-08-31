/**
 * Test server for Canvas API without database dependencies
 * This allows testing the API structure without Prisma binaries
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { z } from 'zod';

const app = express();

// Mock database
let canvases = [];
let posts = [];
let idCounter = 1;

function generateId() {
  return 'mock_' + (idCounter++);
}

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json({ limit: '25mb' }));

// Create uploads directory
const uploadDir = path.join(process.cwd(), 'backend', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Serve static files
app.use('/uploads', express.static(uploadDir));

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  }
});

// Zod schemas
const textPostSchema = z.object({
  type: z.literal('TEXT'),
  content: z.string().min(1, 'Content is required for text posts')
});

const mediaPostSchema = z.object({
  type: z.enum(['IMAGE', 'VIDEO'])
});

// Routes
app.get('/health', (req, res) => res.json({ ok: true }));

// Create canvas
app.post('/api/canvas', (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const canvas = {
    id: generateId(),
    title,
    description: description || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  canvases.push(canvas);
  res.status(201).json(canvas);
});

// List canvases
app.get('/api/canvas', (req, res) => {
  const result = canvases.map(canvas => ({
    ...canvas,
    posts: posts.filter(p => p.canvasId === canvas.id).slice(0, 5)
  }));
  res.json(result);
});

// Create post
app.post('/api/canvas/:id/post', upload.single('file'), (req, res) => {
  const canvasId = req.params.id;
  
  const canvas = canvases.find(c => c.id === canvasId);
  if (!canvas) {
    return res.status(404).json({ error: 'Canvas not found' });
  }

  const contentType = req.get('Content-Type') || '';
  
  if (contentType.includes('application/json')) {
    // Text post
    const validation = textPostSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid text post data', 
        details: validation.error.issues 
      });
    }

    const post = {
      id: generateId(),
      canvasId,
      type: 'TEXT',
      content: validation.data.content,
      fileUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    posts.push(post);
    res.status(201).json(post);
    
  } else if (contentType.includes('multipart/form-data')) {
    // Media post
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
    
    // File size validation
    const fileSizeInMB = req.file.size / (1024 * 1024);
    if (type === 'IMAGE' && fileSizeInMB > 10) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Image files must be under 10MB' });
    }
    if (type === 'VIDEO' && fileSizeInMB > 50) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Video files must be under 50MB' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    const post = {
      id: generateId(),
      canvasId,
      type,
      content: null,
      fileUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    posts.push(post);
    res.status(201).json(post);
    
  } else {
    return res.status(400).json({ 
      error: 'Content-Type must be application/json for text posts or multipart/form-data for media posts' 
    });
  }
});

// Get posts for canvas
app.get('/api/canvas/:id/posts', (req, res) => {
  const canvasId = req.params.id;
  
  const canvas = canvases.find(c => c.id === canvasId);
  if (!canvas) {
    return res.status(404).json({ error: 'Canvas not found' });
  }

  const canvasPosts = posts.filter(p => p.canvasId === canvasId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  res.json(canvasPosts);
});

const port = process.env.PORT || 4001;
app.listen(port, () => {
  console.log(`🧪 Test Canvas API server listening on port ${port}`);
  console.log(`📋 Test endpoints:`);
  console.log(`   POST http://localhost:${port}/api/canvas`);
  console.log(`   GET  http://localhost:${port}/api/canvas`);
  console.log(`   POST http://localhost:${port}/api/canvas/:id/post`);
  console.log(`   GET  http://localhost:${port}/api/canvas/:id/posts`);
});
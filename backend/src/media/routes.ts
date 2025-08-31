import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../auth/middleware';
import { uploadImage, uploadVideo } from './storage';

const router = Router();

// Upload image endpoint (admin only)
router.post('/image', requireAuth, requireAdmin, uploadImage.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const fileMetadata = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: `/media/${req.file.filename}`,
      uploadedAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: fileMetadata,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload video endpoint (admin only)
router.post('/video', requireAuth, requireAdmin, uploadVideo.single('video'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const fileMetadata = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: `/media/${req.file.filename}`,
      uploadedAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: fileMetadata,
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Error handling middleware for multer errors
router.use((error: any, req: Request, res: Response, next: any) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ 
      error: 'File too large',
      details: error.message 
    });
  }
  
  if (error.message) {
    return res.status(400).json({ 
      error: 'Upload error',
      details: error.message 
    });
  }
  
  next(error);
});

export default router;
import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';

// Import routes
import authRoutes from './auth/routes';
import mediaRoutes from './media/routes';
import articlesRoutes from './articles/routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploaded media
app.use('/media', express.static(path.join(process.cwd(), config.MEDIA_LOCAL_DIR)));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/media', mediaRoutes);
app.use('/articles', articlesRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Github Canvas Makeover Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/auth/login',
      media: {
        upload_image: 'POST /media/image',
        upload_video: 'POST /media/video',
      },
      articles: {
        create: 'POST /articles',
        list: 'GET /articles',
        get: 'GET /articles/:id',
      },
    },
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    ...(config.NODE_ENV === 'development' && { details: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const startServer = async () => {
  try {
    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`);
      console.log(`📊 Environment: ${config.NODE_ENV}`);
      console.log(`🏥 Health check: http://localhost:${config.PORT}/health`);
      console.log(`📁 Media uploads: ${config.MEDIA_LOCAL_DIR}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

startServer().catch(console.error);
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { authFromCookie } from './auth/authMiddleware.js';
import { authRouter } from './routes/auth.js';
import { mediaRouter } from './routes/media.js';
import { uploadsPutRouter } from './routes/uploadsPut.js';
import { articlesRouter } from './routes/articles.js';
import { postsRouter } from './routes/posts.js';
import { healthRouter } from './modules/health/health.router.js';
import { canvasRouter } from './modules/canvas/canvas.router.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

const app = express();

const origins = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({ origin: origins.length? origins: true, credentials: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json({ limit: '25mb' }));

// Health endpoints (public)
app.use('/health', healthRouter);

// Canvas API endpoints (public for now)
// TODO: Add authentication middleware when implementing auth system
app.use('/api/canvas', canvasRouter);

// Existing auth and content routes
app.use(authFromCookie);
app.use(uploadsPutRouter);
app.use('/uploads', express.static(path.join(process.cwd(), 'backend', 'uploads')));

app.use(authRouter);
app.use(mediaRouter);
app.use(articlesRouter);
app.use(postsRouter);

// TODO: Add OpenAPI documentation generation
// TODO: Add authentication middleware for protected routes
// TODO: Add rate limiting middleware
// TODO: Add structured logging with request correlation IDs

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export { app };

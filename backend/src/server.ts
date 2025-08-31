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
import { canvasRouter } from './routes/canvas.js';

const app = express();

const origins = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({ origin: origins.length? origins: true, credentials: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json({ limit: '25mb' }));
app.use(authFromCookie);
app.use(uploadsPutRouter);
app.use('/uploads', express.static(path.join(process.cwd(), 'backend', 'uploads')));

app.get('/health', (_req,res)=>res.json({ ok: true }));
app.use(authRouter);
app.use(mediaRouter);
app.use(articlesRouter);
app.use(postsRouter);
app.use(canvasRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log('API listening on', port);
});

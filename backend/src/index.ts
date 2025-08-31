import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { httpLogger } from './logger.js';
import authRoutes from './auth/routes.js';
import mediaRoutes from './media/routes.js';
import articleRoutes from './articles/routes.js';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());
app.use(httpLogger);

app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/media', mediaRoutes);
app.use('/articles', articleRoutes);

// Admin test page (static)
app.use('/admin', express.static(path.join(process.cwd(), 'backend', 'public')));

app.listen(config.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on :${config.PORT}`);
});
import { Router } from 'express';
import { prisma } from '../prisma/client.js';
import { devLoginEnabled } from '../auth/authMiddleware.js';

export const authRouter = Router();

authRouter.post('/auth/dev-login', async (req, res) => {
  if (!devLoginEnabled()) return res.status(403).json({ error: 'Disabled' });

  const { email, role } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, role: role === 'ADMIN' ? 'ADMIN' : 'USER' } });
  }

  res.cookie('sessionUserId', user.id, { httpOnly: true, sameSite: 'lax' });
  res.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
});

// Admin login with username/password from environment variables (for simple gated access)
authRouter.post('/auth/admin-login', async (req, res) => {
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || process.env.ADMIN_USER;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS;
  const { username, password } = req.body || {};

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    return res.status(503).json({ error: 'Admin credentials not configured' });
  }
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid credentials' });

  // Create or fetch the ADMIN user bound to this username (email-like)
  const email = `${ADMIN_USERNAME}@local.admin`;
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, role: 'ADMIN' } });
  } else if (user.role !== 'ADMIN') {
    user = await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
  }

  res.cookie('sessionUserId', user.id, { httpOnly: true, sameSite: 'lax' });
  res.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
});

authRouter.get('/auth/me', async (req, res) => {
  // Resolve from cookie middleware (authFromCookie)
  // If not set, return anonymous
  const id = (req as any).user?.id;
  if (!id) return res.json({ user: null });
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.json({ user: null });
  res.json({ user: { id: user.id, email: user.email, role: user.role } });
});

authRouter.post('/auth/logout', (req, res) => {
  res.clearCookie('sessionUserId');
  res.json({ ok: true });
});

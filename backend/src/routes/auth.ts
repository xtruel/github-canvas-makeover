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

authRouter.get('/auth/me', async (req: any, res) => {
  const id = req.cookies?.sessionUserId;
  if (!id) return res.status(401).json({ error: 'Not authenticated' });

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(401).json({ error: 'User not found' });

  res.json({ user: { id: user.id, email: user.email, role: user.role } });
});

authRouter.post('/auth/logout', (req, res) => {
  res.clearCookie('sessionUserId');
  res.json({ ok: true });
});

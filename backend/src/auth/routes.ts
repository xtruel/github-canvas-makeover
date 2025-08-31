import { Router } from 'express';
import { prisma } from '../prisma.js';
import { config } from '../config.js';
import { hashPassword, verifyPassword } from './hash.js';
import { signToken } from './jwt.js';

const router = Router();

/**
 * Initialize admin user if not exists.
 */
async function ensureAdmin() {
  const existing = await prisma.user.findUnique({ where: { username: config.ADMIN_USERNAME } });
  if (!existing) {
    await prisma.user.create({
      data: {
        username: config.ADMIN_USERNAME,
        passwordHash: await hashPassword(config.ADMIN_PASSWORD),
        role: 'admin',
      },
    });
    // eslint-disable-next-line no-console
    console.log('[seed] Admin user created');
  }
}

// Call once on module load (fire and forget)
sureAdmin().catch((e) => console.error('Admin init failed', e));

router.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken({ sub: user.id, username: user.username, role: user.role });
  res.json({ token });
});

export default router;
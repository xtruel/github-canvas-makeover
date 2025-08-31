import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client.js';

// Define UserRole enum locally since Prisma client generation has issues
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface AuthRequest extends Request {
  user?: { id: string; role: UserRole };
}

export function devLoginEnabled() {
  return process.env.NODE_ENV !== 'production';
}

export async function authFromCookie(req: AuthRequest, _res: Response, next: NextFunction) {
  const id = req.cookies?.sessionUserId;
  if (id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) req.user = { id: user.id, role: user.role };
  }
  next();
}

export function authRequired() {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    next();
  };
}

export function requireAdmin() {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

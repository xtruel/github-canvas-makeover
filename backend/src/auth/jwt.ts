import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
}

export function signToken(payload: Omit<JwtPayload, 'sub'> & { sub: string }): string {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '2h' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
}
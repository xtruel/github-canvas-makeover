import jwt from 'jsonwebtoken';
import { config } from './config';

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    return payload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
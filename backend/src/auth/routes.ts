import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { hashPassword, verifyPassword } from '../hash';
import { signToken } from '../jwt';
import { config } from '../config';

const router = Router();

// Login schema validation
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Admin bootstrap function
const ensureAdmin = async (): Promise<void> => {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { username: config.ADMIN_USERNAME },
    });

    if (!existingAdmin) {
      const hashedPassword = await hashPassword(config.ADMIN_PASSWORD);
      
      await prisma.user.create({
        data: {
          username: config.ADMIN_USERNAME,
          password: hashedPassword,
          role: 'admin',
        },
      });
      
      console.log('✅ Admin user created successfully');
    } else if (existingAdmin.role !== 'admin') {
      // Update role if user exists but is not admin
      await prisma.user.update({
        where: { username: config.ADMIN_USERNAME },
        data: { role: 'admin' },
      });
      
      console.log('✅ Admin role updated for existing user');
    }
  } catch (error) {
    console.error('❌ Error ensuring admin user:', error);
    throw error;
  }
};

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { username, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bootstrap admin on startup
ensureAdmin().catch(console.error);

export default router;
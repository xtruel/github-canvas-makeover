import { prisma } from '../src/prisma/client.js';

async function main() {
  const adminEmail = 'admin@example.com';
  const admin = await prisma.user.upsert({
    where:{ email: adminEmail },
    update:{},
    create:{ email: adminEmail, role: 'ADMIN' }
  });
  console.log('Admin user id:', admin.id);

  // Seed some Canvas records for testing the Canvas API
  const canvas1 = await prisma.canvas.upsert({
    where: { id: 'canvas-test-1' },
    update: {},
    create: {
      id: 'canvas-test-1',
      name: 'Sample Canvas 1',
      description: 'A test canvas for development and API testing'
    }
  });

  const canvas2 = await prisma.canvas.upsert({
    where: { id: 'canvas-test-2' },
    update: {},
    create: {
      id: 'canvas-test-2', 
      name: 'Sample Canvas 2',
      description: null
    }
  });

  const canvas3 = await prisma.canvas.upsert({
    where: { id: 'canvas-test-3' },
    update: {},
    create: {
      id: 'canvas-test-3',
      name: 'Sample Canvas 3', 
      description: 'Another test canvas for pagination testing'
    }
  });

  console.log('Seeded Canvas records:', { canvas1: canvas1.id, canvas2: canvas2.id, canvas3: canvas3.id });
}

main().finally(()=>prisma.$disconnect());

import { prisma } from '../src/prisma/client.js';

async function main() {
  const adminEmail = 'admin@example.com';
  const admin = await prisma.user.upsert({
    where:{ email: adminEmail },
    update:{},
    create:{ email: adminEmail, role: 'ADMIN' }
  });
  console.log('Admin user id:', admin.id);
}

main().finally(()=>prisma.$disconnect());

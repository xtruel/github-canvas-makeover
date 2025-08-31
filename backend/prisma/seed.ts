import { prisma } from '../src/prisma.js';
import { config } from '../src/config.js';
import { hashPassword } from '../src/auth/hash.js';

async function main() {
  const admin = await prisma.user.findUnique({ where: { username: config.ADMIN_USERNAME } });
  if (!admin) {
    await prisma.user.create({
      data: {
        username: config.ADMIN_USERNAME,
        passwordHash: await hashPassword(config.ADMIN_PASSWORD),
        role: 'admin',
      },
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
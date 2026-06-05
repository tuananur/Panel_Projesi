const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const setting = await prisma.setting.findUnique({ where: { key: 'role_permissions' } });
  console.log('--- ROLE PERMISSIONS ---');
  console.log(setting ? setting.value : 'No custom permissions found (using defaults)');
  
  const users = await prisma.user.findMany({ select: { username: true, role: true } });
  console.log('--- USERS ---');
  console.log(JSON.stringify(users, null, 2));
  
  process.exit(0);
}

check();

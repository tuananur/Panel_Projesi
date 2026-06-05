const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clients = await prisma.client.findMany();
  console.log('Client Services check:');
  clients.forEach(c => {
    try {
      JSON.parse(c.services || '[]');
      console.log(`- ${c.companyName}: OK`);
    } catch (e) {
      console.log(`- ${c.companyName}: INVALID JSON ("${c.services}")`);
    }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clients = await prisma.client.findMany();
  console.log('Clients:');
  clients.forEach(c => console.log(`${c.id}: ${c.companyName}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());

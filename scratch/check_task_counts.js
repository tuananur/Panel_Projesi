const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clients = await prisma.client.findMany({
    include: {
      _count: {
        select: { tasks: true }
      }
    }
  });

  console.log('Client Task Counts:');
  clients.forEach(c => {
    console.log(`${c.companyName} (ID: ${c.id}): ${c._count.tasks} tasks`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());

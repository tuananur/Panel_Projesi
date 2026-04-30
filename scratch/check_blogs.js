const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const tasks = await prisma.task.findMany({
    where: { type: 'BLOG' },
    include: { client: true }
  });
  console.log('Total BLOG tasks:', tasks.length);
  tasks.forEach(t => {
    console.log(`Client: ${t.client.companyName}, Task: ${t.note}, Date: ${t.date}`);
  });
  process.exit(0);
}

check();

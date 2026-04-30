const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  const deleted = await prisma.task.deleteMany({
    where: { 
      type: 'BLOG',
      link: { contains: '/blog/' } // These were the wrong ones
    }
  });
  console.log('Deleted incorrect blog tasks:', deleted.count);
  process.exit(0);
}

clean();

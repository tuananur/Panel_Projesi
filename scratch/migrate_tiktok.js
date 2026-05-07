const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting migration: TikTok -> Pinterest');

  // 1. Update Tasks
  const updatedTasks = await prisma.task.updateMany({
    where: { platform: 'TikTok' },
    data: { platform: 'Pinterest' }
  });
  console.log(`Updated ${updatedTasks.count} tasks.`);

  // 2. Update Clients (socialAccounts and socialSchedule)
  const clients = await prisma.client.findMany();
  let clientUpdateCount = 0;

  for (const client of clients) {
    let changed = false;
    let socialAccounts = {};
    let socialSchedule = {};

    try {
      socialAccounts = JSON.parse(client.socialAccounts || '{}');
      socialSchedule = JSON.parse(client.socialSchedule || '{}');
    } catch (e) {
      console.error(`Error parsing JSON for client ${client.id}`);
      continue;
    }

    // Migrate socialAccounts keys
    if (socialAccounts.TikTok !== undefined) {
      socialAccounts.Pinterest = socialAccounts.TikTok;
      delete socialAccounts.TikTok;
      changed = true;
    }

    // Migrate socialSchedule keys
    if (socialSchedule.TikTok !== undefined) {
      socialSchedule.Pinterest = socialSchedule.TikTok;
      delete socialSchedule.TikTok;
      changed = true;
    }

    if (changed) {
      await prisma.client.update({
        where: { id: client.id },
        data: {
          socialAccounts: JSON.stringify(socialAccounts),
          socialSchedule: JSON.stringify(socialSchedule)
        }
      });
      clientUpdateCount++;
    }
  }

  console.log(`Updated ${clientUpdateCount} clients.`);
  console.log('Migration finished.');
}

migrate()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

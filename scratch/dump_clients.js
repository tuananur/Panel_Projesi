const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clients = await prisma.client.findMany({
    include: { tasks: true }
  });
  console.log('--- ALL CLIENTS DATA ---');
  clients.forEach(c => {
    console.log(`\nID: ${c.id}`);
    console.log(`Company: ${c.companyName}`);
    console.log(`Meta Account ID: ${c.metaAdAccountId}`);
    console.log(`Meta Token: ${c.metaAccessToken ? 'SET' : 'MISSING'}`);
    console.log(`Google Refresh Token: ${c.googleRefreshToken ? 'SET' : 'MISSING'}`);
    console.log(`Social Accounts: ${c.socialAccounts}`);
    console.log(`Social Schedule: ${c.socialSchedule}`);
    console.log(`Tasks Count: ${c.tasks.length}`);
    
    // Check if tasks have valid dates
    const invalidDates = c.tasks.filter(t => !t.date || isNaN(new Date(t.date).getTime()));
    if (invalidDates.length > 0) {
      console.log(`!!! Found ${invalidDates.length} tasks with INVALID dates`);
    }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());

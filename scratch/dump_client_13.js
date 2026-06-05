const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const client = await prisma.client.findUnique({
      where: { id: 13 },
      include: { tasks: true }
    });
    console.log("CLIENT 13 DATA:", JSON.stringify(client, null, 2));
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

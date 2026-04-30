import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import StatsContent from './stats-content';

export default async function StatsPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) },
    include: {
      tasks: true
    }
  });

  if (!client) return null;

  return (
    <StatsContent client={client} />
  );
}

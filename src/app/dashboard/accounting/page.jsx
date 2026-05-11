import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import AccountingClient from './accounting-client';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Muhasebe | Beyin Atölyesi',
};

export default async function AccountingPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'ADMIN') redirect('/dashboard');

  const entries = await prisma.accountingEntry.findMany({
    orderBy: { date: 'desc' }
  });

  return (
    <AccountingClient 
      initialEntries={entries} 
      userRole={session.role}
    />
  );
}

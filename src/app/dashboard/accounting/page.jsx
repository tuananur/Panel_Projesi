import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import AccountingClient from './accounting-client';
import { redirect } from 'next/navigation';
import { can, getRolePermissions } from '@/lib/permissions';

export const metadata = {
  title: 'Muhasebe | Beyin Atölyesi',
};

export default async function AccountingPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const permissions = await getRolePermissions(session);
  if (!can(permissions, session.role, 'page.accounting')) redirect('/dashboard');

  const entries = await prisma.accountingEntry.findMany({
    orderBy: { date: 'desc' },
  });

  let debts = [];
  let credits = [];
  try {
    debts = await prisma.accountingDebt.findMany({
      orderBy: [{ isPaid: 'asc' }, { createdAt: 'desc' }],
    });
  } catch (error) {
    console.error('AccountingDebt fetch error (migration pending?):', error);
  }
  try {
    credits = await prisma.accountingCredit.findMany({
      orderBy: [{ remainingAmount: 'desc' }, { createdAt: 'desc' }],
    });
  } catch (error) {
    console.error('AccountingCredit fetch error (migration pending?):', error);
  }

  return (
    <AccountingClient
      initialEntries={entries}
      initialDebts={debts}
      initialCredits={credits}
      userRole={session.role}
    />
  );
}

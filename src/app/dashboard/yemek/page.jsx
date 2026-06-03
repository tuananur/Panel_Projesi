import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { can, getRolePermissions } from '@/lib/permissions';
import MealsClient from './meals-client';

export const metadata = {
  title: 'Yemek | Beyin Atölyesi',
};

export default async function MealsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const permissions = await getRolePermissions(session);
  if (!can(permissions, session.role, 'page.meals')) redirect('/dashboard');

  let orders = [];
  try {
    const rows = await prisma.mealOrder.findMany({
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
    orders = rows.map((row) => ({
      id: row.id,
      personCount: row.personCount,
      cost: row.cost,
      date: row.date.toISOString(),
      createdAt: row.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('MealOrder fetch error (migration pending?):', error);
  }

  return <MealsClient initialOrders={orders} />;
}

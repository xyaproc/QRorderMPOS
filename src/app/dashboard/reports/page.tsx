import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ReportsClient from '@/components/dashboard/ReportsClient';

export const dynamic = 'force-dynamic';

export default async function ReportsRoute({ searchParams }: { searchParams: Promise<{ period?: string; from?: string; to?: string }> }) {
  const resolvedParams = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return notFound();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { restaurants: true }
  });

  const restaurant = user?.restaurants[0];
  if (!restaurant) return notFound();

  // Build date filter
  const period = resolvedParams.period || 'monthly';
  const now = new Date();
  let fromDate = new Date();
  
  if (resolvedParams.from && resolvedParams.to) {
    fromDate = new Date(resolvedParams.from);
  } else if (period === 'daily') {
    fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === 'weekly') {
    fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else {
    fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const toDate = resolvedParams.to ? new Date(resolvedParams.to + 'T23:59:59') : now;

  const orders = await prisma.order.findMany({
    where: { 
      restaurantId: restaurant.id,
      createdAt: { gte: fromDate, lte: toDate }
    },
    include: { 
      table: true,
      orderItems: { include: { menu: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return <ReportsClient orders={orders} period={period} fromDate={fromDate.toISOString()} toDate={toDate.toISOString()} />;
}

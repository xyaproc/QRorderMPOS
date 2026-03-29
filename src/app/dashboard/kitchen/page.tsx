import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import KitchenBoard from '../../../components/dashboard/KitchenBoard';

export const dynamic = 'force-dynamic';

export default async function KitchenDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return notFound();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { restaurants: true }
  });

  const restaurant = user?.restaurants[0];
  if (!restaurant) return notFound();

  const activeOrders = await prisma.order.findMany({
    where: { 
      restaurantId: restaurant.id,
      status: { in: ['WAITING', 'COOKING', 'READY'] }
    },
    include: { 
      table: true,
      orderItems: { include: { menu: true } }
    },
    orderBy: { createdAt: 'asc' }
  });

  return <KitchenBoard initialOrders={activeOrders as any[]} />;
}

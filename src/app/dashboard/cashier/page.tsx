import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import CashierPOS from '@/components/dashboard/CashierPOS';

export const dynamic = 'force-dynamic';

export default async function CashierPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return notFound();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { restaurants: true }
  });

  const restaurant = user?.restaurants[0];
  if (!restaurant) return notFound();

  const restaurantData = await prisma.restaurant.findUnique({
    where: { id: restaurant.id },
    include: {
      categories: {
        include: {
          menus: {
            where: { isAvailable: true },
            orderBy: { name: 'asc' }
          }
        },
        orderBy: { name: 'asc' }
      },
      tables: {
        where: { isActive: true },
        orderBy: { number: 'asc' }
      }
    }
  });

  if (!restaurantData) return notFound();

  return <CashierPOS restaurant={restaurantData} />;
}

import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import OrderTracker from '@/components/OrderTracker';

export const dynamic = 'force-dynamic';

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>;
}) {
  const { tenant, id } = await params;

  // Verify the order belongs to this tenant's restaurant
  const restaurant = await prisma.restaurant.findUnique({
    where: { subdomain: tenant },
    include: { theme: true }
  });

  if (!restaurant) notFound();

  const order = await prisma.order.findFirst({
    where: { id, restaurantId: restaurant.id }
  });

  if (!order) notFound();

  return (
    <OrderTracker
      orderId={id}
      tenant={tenant}
      primaryColor={restaurant.theme?.primaryColor || '#18181b'}
    />
  );
}

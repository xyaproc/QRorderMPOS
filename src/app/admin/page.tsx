import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import SuperAdminClient from '@/components/admin/SuperAdminClient';

export const dynamic = 'force-dynamic';

export default async function SuperAdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return notFound();

  const tenants = await prisma.restaurant.findMany({
    include: { owner: true, subscription: true },
    orderBy: { createdAt: 'desc' }
  });

  const users = await prisma.user.findMany({
    include: { restaurants: true },
    orderBy: { createdAt: 'desc' }
  });

  const totalOrders = await prisma.order.count();

  return <SuperAdminClient tenants={tenants} users={users} totalOrders={totalOrders} />;
}

import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import LandingPageRenderer from '@/components/templates/LandingPageRenderer';

export const dynamic = 'force-dynamic';

export default async function TenantLandingPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const restaurant = await prisma.restaurant.findUnique({
    where: { subdomain: tenant },
    include: {
      theme: true,
      categories: {
        include: { menus: true },
      },
      promos: true,
    },
  });

  if (!restaurant) {
    notFound();
  }

  return <LandingPageRenderer restaurant={restaurant} tenant={tenant} />;
}

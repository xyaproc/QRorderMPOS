import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  // Verify the tenant exists
  const restaurant = await prisma.restaurant.findUnique({
    where: { subdomain: tenant },
    include: { theme: true },
  });

  if (!restaurant) {
    notFound();
  }

  return (
    <div className={`tenant-wrapper min-h-screen bg-background font-sans ${restaurant.theme?.fontFamily || ''}`}>
      {/* We can inject custom CSS variables here based on the theme */}
      {children}
    </div>
  );
}

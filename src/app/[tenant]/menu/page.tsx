import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ClientMenu from './ClientMenu';

export const dynamic = 'force-dynamic';

export default async function TenantMenuPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ table?: string }>;
}) {
  const { tenant } = await params;
  const resolvedSearchParams = await searchParams;
  
  const restaurant = await prisma.restaurant.findUnique({
    where: { subdomain: tenant },
    include: {
      categories: {
        include: {
          menus: {
            orderBy: { name: 'asc' }
          },
        },
        orderBy: { name: 'asc' }
      },
      theme: true,
    }
  });

  if (!restaurant) {
    notFound();
  }

  // Validate table if provided
  let validTable = false;
  if (resolvedSearchParams.table) {
    try {
      const table = await prisma.table.findUnique({
        where: {
          restaurantId_number: {
            restaurantId: restaurant.id,
            number: resolvedSearchParams.table
          }
        }
      });
      if (table && table.isActive) {
        validTable = true;
      }
    } catch (err) {
      console.error('Table lookup error:', err);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      {/* Menu Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 p-4 border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {restaurant.logoUrl ? (
              <img src={restaurant.logoUrl} alt="Logo" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 bg-zinc-900 text-white flex items-center justify-center font-bold rounded-full">
                {restaurant.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-bold text-zinc-900">{restaurant.name}</h1>
              {validTable ? (
                <p className="text-xs font-semibold text-green-600 bg-green-50 px-2 rounded-full w-fit">Table {resolvedSearchParams.table}</p>
              ) : (
                <p className="text-xs text-orange-600 bg-orange-50 px-2 rounded-full w-fit">Takeaway / No Table</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 mt-4">
        {/* Pass data to interactive Client Component */}
        <ClientMenu 
          categories={restaurant.categories} 
          tenant={tenant}
          table={resolvedSearchParams.table || ''}
          primaryColor={restaurant.theme?.primaryColor || '#18181b'}
          restaurantId={restaurant.id}
          restaurantPhone={restaurant.phone || ''}
        />
      </main>
    </div>
  );
}

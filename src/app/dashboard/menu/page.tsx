import prisma from '@/lib/prisma';
import { Plus, Trash2 } from 'lucide-react';
import { addCategory, deleteCategory, addMenuItem } from '@/app/actions/dashboard';
import MenuActions from '@/components/dashboard/MenuActions';
import CategoryActions from '@/components/dashboard/CategoryActions';
import Link from 'next/link';
import { formatIDR } from '@/lib/format';

export default async function MenuManagementPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category: filterCategoryId } = await searchParams;
  
  // Get restaurant for the currently logged-in user
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/lib/auth');
  const session = await getServerSession(authOptions);
  
  const user = session?.user?.email ? await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { restaurants: true }
  }) : null;
  
  const restaurant = user?.restaurants?.[0] 
    ?? await prisma.restaurant.findFirst({ orderBy: { createdAt: 'asc' } });
  
  if (!restaurant) return <div className="p-8 text-zinc-500">No restaurant found. Please complete setup.</div>;
  
  const restaurantWithCategories = await prisma.restaurant.findUnique({
    where: { id: restaurant.id },
    include: {
      categories: {
        include: { menus: true },
        orderBy: { name: 'asc' }
      }
    }
  });

  if (!restaurantWithCategories) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Menu Management</h1>
          <p className="text-zinc-500 mt-1">Click a category name to rename it. Add items to a specific category.</p>
        </div>
        <form action={addCategory.bind(null, restaurantWithCategories.id)}>
          <button type="submit" className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95">
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </form>
      </div>

      {/* Category Filter Tabs */}
      {restaurantWithCategories.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/menu" className={`px-4 py-2 rounded-full text-sm font-bold border shadow-sm transition-all ${!filterCategoryId || filterCategoryId === 'all' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'}`}>
            All Categories
          </Link>
          {restaurantWithCategories.categories.map((c: any) => (
            <Link key={c.id} href={`/dashboard/menu?category=${c.id}`} className={`px-4 py-2 rounded-full text-sm font-bold border shadow-sm transition-all ${filterCategoryId === c.id ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'}`}>
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="space-y-8">
        {restaurantWithCategories.categories.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-zinc-300 rounded-2xl">
            <p className="text-zinc-500 text-lg font-medium">No categories yet.</p>
            <p className="text-zinc-400 text-sm mt-1">Click "Add Category" then rename it — e.g. "Makanan", "Minuman", "Snack".</p>
          </div>
        ) : (
          restaurantWithCategories.categories
            .filter((c: any) => !filterCategoryId || filterCategoryId === 'all' || c.id === filterCategoryId)
            .map((category: any) => (
            <div key={category.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                <div className="flex items-center gap-3">
                  {/* Inline editable category name */}
                  <CategoryActions category={category} />
                  <span className="text-xs px-2 py-1 bg-zinc-200 text-zinc-600 rounded-full font-medium">{category.menus.length} items</span>
                </div>
                <div className="flex gap-2 items-center">
                  <form action={deleteCategory.bind(null, category.id)}>
                    <button type="submit" title="Delete category" className="p-2 text-zinc-400 hover:text-red-500 transition-colors hover:bg-zinc-100 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                  <form action={addMenuItem.bind(null, category.id, restaurantWithCategories.id)}>
                    <button type="submit" className="ml-2 flex items-center gap-2 bg-zinc-900 text-white font-medium py-1.5 px-4 rounded-lg text-sm hover:bg-zinc-800 transition-colors">
                      <Plus className="w-4 h-4" /> Add Item
                    </button>
                  </form>
                </div>
              </div>
              <div className="p-6">
                {category.menus.length === 0 ? (
                  <p className="text-zinc-400 text-center py-6 border border-dashed border-zinc-200 rounded-xl text-sm">
                    No items in this category. Click "+ Add Item" to start adding menus here.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {category.menus.map((menu: any) => (
                      <div key={menu.id} className="flex gap-4 p-4 rounded-xl border border-zinc-100 hover:border-zinc-300 transition-colors group bg-zinc-50/50">
                        <div className="w-20 h-20 bg-zinc-200 rounded-lg flex-shrink-0 overflow-hidden relative">
                          {menu.imageUrl ? (
                            <img src={menu.imageUrl} alt={menu.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold text-xs">NO IMG</div>
                          )}
                          {!menu.isAvailable && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white text-xs font-bold px-1 py-0.5 bg-red-500 rounded-sm">HABIS</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-zinc-900 truncate">{menu.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="font-semibold text-primary">{formatIDR(menu.discountPrice ?? menu.price)}</p>
                            {menu.discountPrice && (
                              <p className="text-xs text-zinc-400 line-through">{formatIDR(menu.price)}</p>
                            )}
                          </div>
                          <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{menu.description}</p>
                        </div>
                        <MenuActions menu={menu} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

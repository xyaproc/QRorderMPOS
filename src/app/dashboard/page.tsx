import prisma from '@/lib/prisma';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { formatIDR } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function TenantOverviewPage() {
  const session = await getServerSession(authOptions);

  // Get restaurant from session
  const user = session?.user?.email ? await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { restaurants: true }
  }) : null;

  const restaurant = user?.restaurants?.[0] ?? await prisma.restaurant.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!restaurant) return <div>Restaurant not found.</div>;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [todayOrders, allMenus, allTables, activeOrderCount] = await Promise.all([
    prisma.order.findMany({
      where: { restaurantId: restaurant.id, createdAt: { gte: startOfToday } },
      include: { table: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.menu.findMany({ where: { restaurantId: restaurant.id } }),
    prisma.table.findMany({ where: { restaurantId: restaurant.id } }),
    prisma.order.count({ where: { restaurantId: restaurant.id, status: { in: ['WAITING', 'COOKING'] } } }),
  ]);

  const todayRevenue = todayOrders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const activeTables = allTables.filter((t) => t.isActive).length;

  const statusLabel: Record<string, string> = {
    WAITING: 'Menunggu', COOKING: 'Memasak', READY: 'Siap', SERVED: 'Tersaji'
  };
  const statusClass: Record<string, string> = {
    WAITING: 'bg-orange-100 text-orange-700',
    COOKING: 'bg-blue-100 text-blue-700',
    READY: 'bg-green-100 text-green-700',
    SERVED: 'bg-zinc-100 text-zinc-600',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Selamat datang, {restaurant.name} 👋</h1>
        <p className="text-zinc-500 mt-1">Berikut ringkasan operasional restoran hari ini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Pendapatan Hari Ini</h3>
          <p className="text-3xl font-extrabold mt-2 text-zinc-900">{formatIDR(todayRevenue)}</p>
          <p className="text-xs text-zinc-400 mt-2">Sudah dibayar hari ini</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Pesanan Hari Ini</h3>
          <p className="text-3xl font-extrabold mt-2 text-zinc-900">{todayOrders.length}</p>
          <p className="text-xs text-orange-500 font-semibold mt-2">{activeOrderCount} sedang diproses</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Meja Aktif</h3>
          <p className="text-3xl font-extrabold mt-2 text-zinc-900">{activeTables} <span className="text-zinc-300 font-normal text-xl">/ {allTables.length}</span></p>
          <p className="text-xs text-zinc-400 mt-2">Total meja terdaftar</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Menu</h3>
          <p className="text-3xl font-extrabold mt-2 text-zinc-900">{allMenus.length}</p>
          <p className="text-xs text-zinc-400 mt-2">Item di semua kategori</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
            <h3 className="font-bold text-lg text-zinc-800">Pesanan Terkini</h3>
            <Link href="/dashboard/reports" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">Lihat Laporan →</Link>
          </div>
          <div>
            {todayOrders.length > 0 ? (
              <ul className="divide-y divide-zinc-100">
                {todayOrders.slice(0, 8).map((order: any) => (
                  <li key={order.id} className="px-6 py-4 flex justify-between items-center hover:bg-zinc-50 transition-colors">
                    <div>
                      <p className="font-semibold text-zinc-800">
                        Meja {order.table?.number || '?'} <span className="text-zinc-400 font-normal">({order.customerName || 'Guest'})</span>
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-zinc-900">{formatIDR(order.totalAmount)}</p>
                      <span className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClass[order.status] || 'bg-zinc-100 text-zinc-600'}`}>
                        {statusLabel[order.status] || order.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-zinc-400">
                <p className="text-4xl mb-2">🍽️</p>
                <p className="font-medium">Belum ada pesanan hari ini.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50">
            <h3 className="font-bold text-lg text-zinc-800">Akses Cepat</h3>
          </div>
          <div className="p-6 space-y-3">
            <Link href="/dashboard/cashier" className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow-md hover:bg-zinc-800 transition-all active:scale-95">
              💰 Buka Kasir
            </Link>
            <Link href="/dashboard/kitchen" className="w-full flex items-center justify-center gap-2 bg-white border-2 border-zinc-200 text-zinc-700 font-bold py-3 px-4 rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-95">
              👨‍🍳 Kitchen Display
            </Link>
            <Link href="/dashboard/tables" className="w-full flex items-center justify-center gap-2 bg-white border-2 border-zinc-200 text-zinc-700 font-bold py-3 px-4 rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-95">
              🔲 Kelola Meja & QR
            </Link>
            <Link href="/dashboard/menu" className="w-full flex items-center justify-center gap-2 bg-white border-2 border-zinc-200 text-zinc-700 font-bold py-3 px-4 rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-95">
              🍔 Tambah Menu
            </Link>
            <Link href="/dashboard/landing" className="w-full flex items-center justify-center gap-2 bg-white border-2 border-zinc-200 text-zinc-700 font-bold py-3 px-4 rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-95">
              🎨 Edit Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import prisma from '@/lib/prisma';
import { QrCode, Plus } from 'lucide-react';
import { addTable } from '@/app/actions/dashboard';
import TableActions from '@/components/dashboard/TableActions';

export default async function TablesManagementPage() {
  const subdomain = 'sate-taichan'; // hardcoded for demo
  const restaurant = await prisma.restaurant.findUnique({
    where: { subdomain },
    include: {
      tables: {
        orderBy: { number: 'asc' }
      }
    }
  });

  if (!restaurant) return <div>Restaurant not found</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Tables & QR Codes</h1>
          <p className="text-zinc-500 mt-1">Manage tables and download QR codes for ordering.</p>
        </div>
        <form action={addTable.bind(null, restaurant.id)}>
          <button type="submit" className="flex items-center gap-2 bg-primary text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95">
            <Plus className="w-5 h-5" />
            Add Table
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {restaurant.tables.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white border border-dashed border-zinc-300 rounded-2xl">
            <p className="text-zinc-500 text-lg">No tables configured yet.</p>
          </div>
        ) : (
          restaurant.tables.map((table: any) => (
            <div key={table.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col group">
              <div className="p-6 text-center border-b border-zinc-100 flex-1 flex flex-col items-center justify-center">
                <div className="w-32 h-32 bg-zinc-100 rounded-xl mb-4 flex items-center justify-center border-2 border-dashed border-zinc-300 relative group-hover:border-primary transition-colors">
                  <QrCode className="w-16 h-16 text-zinc-400 group-hover:text-primary transition-colors" />
                </div>
                <h2 className="text-2xl font-black text-zinc-800">Table {table.number}</h2>
                <div className="mt-2 text-sm text-zinc-500">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${table.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {table.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <TableActions table={table} subdomain={restaurant.subdomain} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

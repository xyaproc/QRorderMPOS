import prisma from '@/lib/prisma';
import { ClipboardList, CheckSquare } from 'lucide-react';

export default async function WaiterDashboard() {
  const subdomain = 'namacafe'; // hardcoded for demo
  const restaurant = await prisma.restaurant.findUnique({
    where: { subdomain },
    include: {
      orders: {
        where: {
          status: { in: ['READY', 'SERVED'] } 
        },
        include: {
          orderItems: { include: { menu: true } },
          table: true,
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!restaurant) return <div>Restaurant not found</div>;

  const readyOrders = restaurant.orders.filter(o => o.status === 'READY');
  const servedOrders = restaurant.orders.filter(o => o.status === 'SERVED');

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-primary" />
            Waiter / Checker
          </h1>
          <p className="text-zinc-500 mt-1">Manage food delivery to tables.</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Ready to Serve</div>
          <div className="text-4xl font-black text-green-600">{readyOrders.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            Action Required
          </h2>
          <div className="space-y-4">
            {readyOrders.length === 0 ? (
              <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-300 text-zinc-400 font-medium">
                No orders waiting to be served.
              </div>
            ) : (
              readyOrders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-green-500 border-zinc-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-zinc-900">Table {order.table.number}</h3>
                      <p className="font-semibold text-zinc-500 mt-0.5">{order.customerName || 'Guest'}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {order.orderItems.map(item => (
                      <li key={item.id} className="flex justify-between text-sm font-medium border-b border-zinc-50 pb-2">
                        <span className="text-zinc-700">{item.quantity}x {item.menu.name}</span>
                        {item.notes && <span className="text-red-500 italic ml-2">({item.notes})</span>}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-3 bg-green-600 text-white font-bold rounded-xl shadow-md hover:bg-green-700 active:scale-95 transition-all text-lg flex items-center justify-center gap-2">
                    <CheckSquare className="w-5 h-5" /> Mark as Served
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-zinc-800 mb-4">Recently Served</h2>
          <div className="space-y-4">
            {servedOrders.slice(0, 10).map(order => (
              <div key={order.id} className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 opacity-70">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-zinc-700">Table {order.table.number}</h3>
                  <span className="text-xs font-bold px-2 py-1 bg-zinc-200 text-zinc-600 rounded">SERVED</span>
                </div>
                <p className="text-sm text-zinc-500 font-medium">{order.orderItems.length} items delivered</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

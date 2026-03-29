'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, ChefHat, CheckCircle2, Play, Check } from 'lucide-react';
import { updateOrderStatus } from '@/app/actions/order';

function TimeAgo({ date }: { date: string | Date }) {
  const [mins, setMins] = useState(0);
  
  useEffect(() => {
    const calc = () => setMins(Math.floor((Date.now() - new Date(date).getTime()) / 60000));
    calc();
    const int = setInterval(calc, 60000);
    return () => clearInterval(int);
  }, [date]);

  return <span className={mins > 15 ? 'text-red-600 font-bold' : 'text-zinc-500'}>{mins}m ago</span>;
}

export default function KitchenBoard({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [mobileStatus, setMobileStatus] = useState<'WAITING' | 'COOKING' | 'READY'>('WAITING');

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 15000); // 15 seconds polling
    return () => clearInterval(interval);
  }, [router]);

  const handleAction = async (orderId: string, status: string) => {
    setLoadingId(orderId);
    try {
      await updateOrderStatus(orderId, status);
    } catch(e) { console.error('Failed order update', e); }
    setLoadingId(null);
  };

  const getCols = (status: string) => initialOrders.filter(o => o.status === status);

  const Column = ({ title, icon: Icon, status, orders, actionBtn }: any) => (
    <div className="flex-1 min-w-[280px] md:min-w-[300px] bg-zinc-50/80 border border-zinc-200 rounded-3xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-black text-lg flex items-center gap-2 text-zinc-800">
          <Icon className="w-5 h-5" /> {title}
        </h3>
        <span className="bg-white text-zinc-700 shadow-sm border border-zinc-200 text-xs font-bold px-3 py-1 rounded-full">{orders.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4 scrollbar-hide">
        {orders.map((o: any) => (
          <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 hover:border-zinc-300 transition-colors relative overflow-hidden">
            {loadingId === o.id && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <div className="flex justify-between items-start mb-3 border-b border-zinc-50 pb-3">
              <div>
                <h4 className="font-black text-xl text-zinc-900 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/20 flex items-center justify-center p-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  </div>
                  Meja {o.table.number}
                </h4>
                <p className="text-xs text-zinc-500 font-medium ml-4">{o.customerName || 'Guest'}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-100 text-xs font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <TimeAgo date={o.createdAt} />
                </div>
                {o.paymentStatus === 'PAID' && (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1 text-[10px] font-black tracking-widest uppercase border border-green-200 shadow-sm">
                    ✅ LUNAS
                  </span>
                )}
              </div>
            </div>
            <ul className="space-y-2 mb-4">
               {o.orderItems.map((item: any) => (
                 <li key={item.id} className="flex gap-3 text-sm text-zinc-800 border-b border-zinc-50 pb-2 last:border-0 last:pb-0">
                   {item.menu.imageUrl ? (
                     <img src={item.menu.imageUrl} alt={item.menu.name} className="w-10 h-10 rounded-lg object-cover bg-zinc-100 shrink-0" />
                   ) : (
                     <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                       <ChefHat className="w-4 h-4 text-zinc-400" />
                     </div>
                   )}
                   <div className="flex-1 flex items-start gap-2">
                     <span className="font-black text-zinc-900 w-6 h-6 flex shrink-0 items-center justify-center bg-zinc-50 border border-zinc-100 rounded text-xs leading-none">{item.quantity}</span>
                     <span className="font-semibold leading-tight pt-0.5">{item.menu.name}</span>
                   </div>
                 </li>
               ))}
            </ul>
            {actionBtn(o)}
          </div>
        ))}
        {orders.length === 0 && (
          <div className="h-48 flex items-center justify-center text-zinc-300 text-sm font-medium p-4 text-center border-2 border-dashed border-zinc-200 rounded-2xl">
            Tidak ada pesanan
          </div>
        )}
      </div>
    </div>
  );

  const COLUMNS = [
    {
      title: 'Pesanan Baru', icon: Clock, status: 'WAITING', orders: getCols('WAITING'),
      actionBtn: (o: any) => (
        <button onClick={() => handleAction(o.id, 'COOKING')} className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 py-2.5 rounded-xl border border-blue-100 font-bold text-sm flex items-center justify-center gap-2 transition-colors">
          <Play className="w-4 h-4 fill-current" /> Mulai Masak
        </button>
      )
    },
    {
      title: 'Sedang Memasak', icon: ChefHat, status: 'COOKING', orders: getCols('COOKING'),
      actionBtn: (o: any) => (
        <button onClick={() => handleAction(o.id, 'READY')} className="w-full bg-green-50 text-green-700 hover:bg-green-100 py-2.5 rounded-xl border border-green-100 font-bold text-sm flex items-center justify-center gap-2 transition-colors">
          <Check className="w-4 h-4" strokeWidth={3} /> Siap Disajikan
        </button>
      )
    },
    {
      title: 'Siap Disajikan', icon: CheckCircle2, status: 'READY', orders: getCols('READY'),
      actionBtn: (o: any) => (
        <button onClick={() => handleAction(o.id, 'SERVED')} className="w-full bg-zinc-900 text-white hover:bg-zinc-800 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center transition-colors shadow-sm">
          Tandai Tersaji
        </button>
      )
    },
  ];

  const activeCol = COLUMNS.find(c => c.status === mobileStatus)!;

  return (
    <div className="flex flex-col h-full space-y-4 pb-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-200 gap-2">
        <div>
           <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
             Kitchen Display <span className="bg-zinc-900 text-white text-xs px-2 py-0.5 rounded-md uppercase tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>LIVE</span>
           </h1>
           <p className="text-zinc-500 text-sm mt-1">Real-time order tracking.</p>
        </div>
      </div>
      
      {/* Mobile/Tablet/iPad Pro: tab selector */}
      <div className="flex xl:hidden bg-zinc-100 rounded-2xl p-1 gap-1">
        {COLUMNS.map(col => (
          <button
            key={col.status}
            onClick={() => setMobileStatus(col.status as any)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileStatus === col.status ? 'bg-white shadow text-zinc-900' : 'text-zinc-500'
            }`}
          >
            <col.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{col.title}</span>
            <span className="sm:hidden">{col.status === 'WAITING' ? 'Baru' : col.status === 'COOKING' ? 'Masak' : 'Siap'}</span>
            {col.orders.length > 0 && (
              <span className="bg-zinc-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black">{col.orders.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Mobile/Tablet/iPad Pro (< xl): single column */}
      <div className="xl:hidden flex-1 overflow-y-auto">
        <div className="h-full">
          <Column {...activeCol} />
        </div>
      </div>

      {/* Desktop (xl+): full kanban */}
      <div className="hidden xl:flex gap-5 overflow-x-auto pb-4 pt-1 flex-1" style={{ minHeight: 0 }}>
        {COLUMNS.map(col => <Column key={col.status} {...col} />)}
      </div>
    </div>
  );
}

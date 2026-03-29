'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { formatIDR } from '@/lib/format';
import { TrendingUp, ShoppingBag, Users, Award, Download, Filter, Table, FileSpreadsheet } from 'lucide-react';

export default function ReportsClient({ orders, period, fromDate, toDate }: {
  orders: any[];
  period: string;
  fromDate: string;
  toDate: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [activePeriod, setActivePeriod] = useState(period);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Top menus by quantity ordered
  const menuMap: Record<string, { name: string; count: number; revenue: number; imageUrl?: string }> = {};
  for (const order of orders) {
    for (const item of order.orderItems) {
      const key = item.menu?.id || item.menuId;
      if (!menuMap[key]) menuMap[key] = { name: item.menu?.name || 'Unknown', count: 0, revenue: 0, imageUrl: item.menu?.imageUrl };
      menuMap[key].count += item.quantity;
      menuMap[key].revenue += item.price * item.quantity;
    }
  }
  const topMenus = Object.values(menuMap).sort((a, b) => b.count - a.count).slice(0, 8);
  const maxCount = topMenus[0]?.count || 1;

  // Top tables
  const tableMap: Record<string, { number: string; count: number; revenue: number }> = {};
  for (const order of orders) {
    const key = order.tableId;
    if (!tableMap[key]) tableMap[key] = { number: order.table?.number || '?', count: 0, revenue: 0 };
    tableMap[key].count += 1;
    tableMap[key].revenue += order.totalAmount;
  }
  const topTables = Object.values(tableMap).sort((a, b) => b.count - a.count).slice(0, 5);

  function changePeriod(p: string) {
    setActivePeriod(p);
    setCustomFrom('');
    setCustomTo('');
    router.push(`${pathname}?period=${p}`);
  }

  function applyCustomRange() {
    if (customFrom && customTo) {
      router.push(`${pathname}?from=${customFrom}&to=${customTo}`);
    }
  }

  async function exportPDF() {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Laporan Pendapatan', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Periode: ${from} – ${to}`, 14, 28);

    // KPI Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Ringkasan', 14, 40);
    autoTable(doc, {
      startY: 44,
      head: [['Metrik', 'Nilai']],
      body: [
        ['Total Pendapatan', formatIDR(totalRevenue)],
        ['Total Pesanan', totalOrders.toString()],
        ['Rata-rata Pesanan', formatIDR(avgOrderValue)],
      ],
      headStyles: { fillColor: [24, 24, 27] },
      styles: { fontSize: 10 },
    });

    // Top Menus
    const afterKPI = (doc as any).lastAutoTable?.finalY || 80;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Menu Terlaris', 14, afterKPI + 12);
    autoTable(doc, {
      startY: afterKPI + 16,
      head: [['Rank', 'Menu', 'Terjual', 'Pendapatan']],
      body: topMenus.map((m, i) => [`#${i + 1}`, m.name, `${m.count}x`, formatIDR(m.revenue)]),
      headStyles: { fillColor: [24, 24, 27] },
      styles: { fontSize: 9 },
    });

    // Orders
    const afterMenus = (doc as any).lastAutoTable?.finalY || 140;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Riwayat Pesanan', 14, afterMenus + 12);
    autoTable(doc, {
      startY: afterMenus + 16,
      head: [['Waktu', 'Pelanggan', 'Meja', 'Total', 'Status']],
      body: orders.slice(0, 50).map(o => [
        new Date(o.createdAt).toLocaleDateString('id-ID'),
        o.customerName || 'Guest',
        `#${o.table?.number || '?'}`,
        formatIDR(o.totalAmount),
        o.status,
      ]),
      headStyles: { fillColor: [24, 24, 27] },
      styles: { fontSize: 8 },
    });

    doc.save(`laporan-${from.replace(/ /g, '-')}-${to.replace(/ /g, '-')}.pdf`);
  }

  async function exportExcel() {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    function setCols(ws: any, widths: number[]) {
      ws['!cols'] = widths.map(w => ({ wch: w }));
    }

    // Sheet 1: Summary
    const summaryRows = [
      ['LAPORAN PENDAPATAN', null],
      [`Periode: ${from} \u2013 ${to}`, null],
      [],
      ['METRIK', 'NILAI'],
      ['Total Pendapatan (Rp)', totalRevenue],
      ['Total Pesanan', totalOrders],
      ['Pesanan Terbayar', orders.filter((o: any) => o.paymentStatus === 'PAID').length],
      ['Rata-rata Nilai Pesanan (Rp)', avgOrderValue],
    ];
    const sw = XLSX.utils.aoa_to_sheet(summaryRows);
    setCols(sw, [35, 20]);
    XLSX.utils.book_append_sheet(wb, sw, 'Ringkasan');

    // Sheet 2: Top Menus
    const menuRows = [
      ['MENU TERLARIS', null, null, null],
      [`Periode: ${from} \u2013 ${to}`, null, null, null],
      [],
      ['Rank', 'Nama Menu', 'Qty Terjual', 'Pendapatan (Rp)'],
      ...topMenus.map((m, i) => [i + 1, m.name, m.count, m.revenue])
    ];
    const mw = XLSX.utils.aoa_to_sheet(menuRows);
    setCols(mw, [6, 35, 14, 20]);
    XLSX.utils.book_append_sheet(wb, mw, 'Menu Terlaris');

    // Sheet 3: Top Tables
    const tableMap2: Record<string, { number: string; count: number; revenue: number }> = {};
    for (const order of orders) {
      const key = order.tableId;
      if (!tableMap2[key]) tableMap2[key] = { number: order.table?.number || '?', count: 0, revenue: 0 };
      tableMap2[key].count += 1;
      tableMap2[key].revenue += order.totalAmount;
    }
    const topT = Object.values(tableMap2).sort((a, b) => b.count - a.count);
    const tableRows = [
      ['MEJA TERAKTIF', null, null],
      [],
      ['Nomor Meja', 'Jumlah Pesanan', 'Total Pendapatan (Rp)'],
      ...topT.map(t => [t.number, t.count, t.revenue])
    ];
    const tw = XLSX.utils.aoa_to_sheet(tableRows);
    setCols(tw, [15, 18, 22]);
    XLSX.utils.book_append_sheet(wb, tw, 'Meja Teraktif');

    // Sheet 4: Orders
    const orderRows = [
      ['RIWAYAT PESANAN', null, null, null, null, null, null],
      [`Periode: ${from} \u2013 ${to}`, null, null, null, null, null, null],
      [],
      ['Waktu', 'Pelanggan', 'Telepon', 'Meja', 'Detail Menu', 'Total (Rp)', 'Status'],
      ...orders.map((o: any) => [
        new Date(o.createdAt).toLocaleString('id-ID'),
        o.customerName || 'Guest',
        o.customerPhone || '',
        `Meja ${o.table?.number || '?'}`,
        o.orderItems.map((i: any) => `${i.quantity}x ${i.menu?.name}`).join(', '),
        o.totalAmount,
        o.status,
      ])
    ];
    const ow = XLSX.utils.aoa_to_sheet(orderRows);
    setCols(ow, [20, 18, 14, 10, 45, 18, 10]);
    XLSX.utils.book_append_sheet(wb, ow, 'Pesanan');

    XLSX.writeFile(wb, `laporan-${from.replace(/ /g, '-')}-${to.replace(/ /g, '-')}.xlsx`);
  }

  const statusColors: Record<string, string> = {
    WAITING: 'bg-orange-100 text-orange-700',
    COOKING: 'bg-blue-100 text-blue-700',
    READY: 'bg-green-100 text-green-700',
    SERVED: 'bg-zinc-100 text-zinc-600',
  };

  const periods = [
    { id: 'daily', label: 'Hari Ini' },
    { id: 'weekly', label: '7 Hari' },
    { id: 'monthly', label: 'Bulan Ini' },
  ];

  const from = new Date(fromDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const to = new Date(toDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-8 pb-16 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-zinc-200">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Laporan Pendapatan</h1>
          <p className="text-zinc-400 text-sm mt-1">{from} – {to}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="flex items-center gap-2 bg-zinc-900 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:bg-zinc-800 transition-all active:scale-95">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button onClick={exportExcel} className="flex items-center gap-2 bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:bg-emerald-700 transition-all active:scale-95">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* Period Filters */}
      <div className="flex flex-wrap gap-3 print:hidden">
        {periods.map(p => (
          <button
            key={p.id}
            onClick={() => changePeriod(p.id)}
            className={`px-5 py-2 rounded-full font-bold text-sm border shadow-sm transition-all ${activePeriod === p.id && !customFrom ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'}`}
          >
            {p.label}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <Filter className="w-4 h-4 text-zinc-400" />
          <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="px-3 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-zinc-900" />
          <span className="text-zinc-400 text-sm">–</span>
          <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="px-3 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-zinc-900" />
          <button onClick={applyCustomRange} disabled={!customFrom || !customTo} className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-bold disabled:opacity-40 hover:bg-zinc-800 transition-all">Terapkan</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Pendapatan</p>
            <p className="text-2xl font-black text-zinc-900 mt-0.5">{formatIDR(totalRevenue)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Pesanan</p>
            <p className="text-2xl font-black text-zinc-900 mt-0.5">{totalOrders}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Rata-rata Pesanan</p>
            <p className="text-2xl font-black text-zinc-900 mt-0.5">{formatIDR(avgOrderValue)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Menus */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2 bg-zinc-50">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-zinc-800">Menu Terlaris</h2>
          </div>
          <div className="p-6 space-y-4">
            {topMenus.length === 0 && <p className="text-zinc-400 text-center py-8">Belum ada data pesanan.</p>}
            {topMenus.map((m, i) => (
              <div key={m.name} className="flex items-center gap-4">
                <div className="w-7 flex-shrink-0 text-center font-black text-zinc-300 text-sm">#{i + 1}</div>
                {m.imageUrl ? (
                  <img src={m.imageUrl} alt={m.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-zinc-100" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex-shrink-0 flex items-center justify-center text-zinc-300 text-xs font-bold">IMG</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-zinc-900 text-sm truncate">{m.name}</span>
                    <span className="text-xs text-zinc-500 ml-2 flex-shrink-0">{m.count}x · {formatIDR(m.revenue)}</span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-700"
                      style={{ width: `${(m.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tables */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2 bg-zinc-50">
            <Table className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-zinc-800">Meja Teraktif</h2>
          </div>
          <div className="p-4 space-y-2">
            {topTables.length === 0 && <p className="text-zinc-400 text-center py-6 text-sm">Belum ada data.</p>}
            {topTables.map((t, i) => (
              <div key={t.number} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-black text-blue-600 text-sm">{t.number}</div>
                <div className="flex-1">
                  <p className="font-bold text-zinc-800 text-sm">Meja {t.number}</p>
                  <p className="text-xs text-zinc-500">{t.count} pesanan</p>
                </div>
                <p className="font-bold text-zinc-700 text-sm">{formatIDR(t.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50">
          <h2 className="font-bold text-zinc-800">Riwayat Pesanan</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-xs font-bold uppercase tracking-widest border-b border-zinc-100">
                <th className="px-6 py-3 text-left">Waktu</th>
                <th className="px-6 py-3 text-left">Pelanggan</th>
                <th className="px-6 py-3 text-left">Meja</th>
                <th className="px-6 py-3 text-left">Menu</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {orders.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-400">Tidak ada pesanan dalam periode ini.</td></tr>
              )}
              {orders.slice(0, 50).map(o => (
                <tr key={o.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-3 text-zinc-500 whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-3">
                    <p className="font-semibold text-zinc-900">{o.customerName || 'Guest'}</p>
                    <p className="text-zinc-400 text-xs">{o.customerPhone || '—'}</p>
                  </td>
                  <td className="px-6 py-3 font-bold text-zinc-700">#{o.table?.number || '?'}</td>
                  <td className="px-6 py-3 text-zinc-500 max-w-[200px] line-clamp-1">
                    {o.orderItems.map((i: any) => `${i.quantity}x ${i.menu?.name}`).join(', ')}
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-zinc-900 whitespace-nowrap">{formatIDR(o.totalAmount)}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[o.status] || 'bg-zinc-100 text-zinc-600'}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { font-size: 12px; }
        }
      `}</style>
    </div>
  );
}

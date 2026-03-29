'use client';

import { useState } from 'react';
import { Download, TrendingUp, DollarSign, ListOrdered, Calendar } from 'lucide-react';

export default function ReportsPage({ ordersData, revenueStr }: { ordersData: any[], revenueStr: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = () => {
    setIsExporting(true);
    // Add print specific class to body temporarily 
    document.body.classList.add('print-mode');
    setTimeout(() => {
      window.print();
      document.body.classList.remove('print-mode');
      setIsExporting(false);
    }, 500);
  };

  return (
    <div className="space-y-8 pb-10 print-container">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-200 hide-on-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Income Report</h1>
          <p className="text-zinc-500 mt-1">Exportable PDF report of your store's performance.</p>
        </div>
        <button 
          onClick={handleExportPDF} 
          disabled={isExporting}
          className="flex items-center gap-2 bg-zinc-900 text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm hover:bg-zinc-800 transition-all disabled:opacity-70"
        >
          <Download className="w-5 h-5" />
          {isExporting ? 'Preparing...' : 'Export to PDF'}
        </button>
      </div>

      <div className="only-print text-center mb-8 hidden">
        <h1 className="text-4xl font-black mb-2">OFFICIAL INCOME REPORT</h1>
        <p className="text-zinc-600">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 text-zinc-500 mb-2 font-medium">
            <DollarSign className="w-5 h-5" /> Total Revenue
          </div>
          <p className="text-4xl font-black text-zinc-900">${revenueStr}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 text-zinc-500 mb-2 font-medium">
            <ListOrdered className="w-5 h-5" /> Total Orders
          </div>
          <p className="text-4xl font-black text-zinc-900">{ordersData.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 text-zinc-500 mb-2 font-medium">
            <TrendingUp className="w-5 h-5" /> Average Order Value
          </div>
          <p className="text-4xl font-black text-zinc-900">
            ${ordersData.length ? (parseFloat(revenueStr) / ordersData.length).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Recents table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50">
          <h3 className="font-bold text-lg text-zinc-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-zinc-400" /> Recent Transactions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-sm text-zinc-500 bg-white">
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Table</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {ordersData.map((order, i) => (
                <tr key={i} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                  <td className="p-4 font-mono text-xs font-semibold text-zinc-600">{order.id.slice(-8)}</td>
                  <td className="p-4 font-semibold">Table {order.table.number}</td>
                  <td className="p-4 text-zinc-500">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="p-4 font-bold text-zinc-900">${order.totalAmount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-600 text-xs font-bold border border-green-200">
                      PAID
                    </span>
                  </td>
                </tr>
              ))}
              {ordersData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    No orders have been recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
          }
          .hide-on-print {
            display: none !important;
          }
          .only-print {
            display: block !important;
          }
          .bg-white {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

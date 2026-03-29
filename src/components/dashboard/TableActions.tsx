'use client';

import { useState } from 'react';
import { Download, Trash2, ExternalLink } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { deleteTable } from '@/app/actions/dashboard';
import { QRCodeSVG } from 'qrcode.react';

export default function TableActions({ table, subdomain }: { table: any, subdomain: string }) {
  const [isQrOpen, setIsQrOpen] = useState(false);
  
  // The full URL the customer will scan
  const orderUrl = `http://${subdomain}.localhost:3000/menu?table=${table.number}`;

  return (
    <>
      <div className="grid grid-cols-2 divide-x divide-zinc-100 bg-zinc-50 border-t border-zinc-100">
        <button onClick={() => setIsQrOpen(true)} type="button" className="py-3 flex items-center justify-center gap-2 text-sm font-semibold text-zinc-600 hover:text-primary hover:bg-zinc-100 transition-colors">
          <Download className="w-4 h-4" /> QR
        </button>
        <form action={deleteTable.bind(null, table.id)} className="w-full">
          <button type="submit" className="w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </form>
      </div>

      <Modal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} title={`Table ${table.number} QR Code`}>
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <div className="p-4 bg-white border-2 border-zinc-200 rounded-2xl shadow-sm">
            <QRCodeSVG value={orderUrl} size={200} />
          </div>
          <div className="text-center w-full">
            <p className="text-sm font-medium text-zinc-500 mb-2">Scan anywhere to order</p>
            <div className="flex items-center justify-between p-2 bg-zinc-100 rounded-lg">
              <span className="text-xs truncate w-[200px] font-mono text-zinc-600">{orderUrl}</span>
              <a href={orderUrl} target="_blank" rel="noreferrer" className="p-1 text-primary hover:bg-zinc-200 rounded shrink-0">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

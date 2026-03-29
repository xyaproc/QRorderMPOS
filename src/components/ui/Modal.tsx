'use client';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        <div className="flex justify-between items-center p-4 border-b border-zinc-100">
          <h3 className="font-bold text-lg text-zinc-900">{title}</h3>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { formatIDR } from '@/lib/format';
import Link from 'next/link';
import { ArrowLeft, Clock, ChefHat, CheckCircle2, Star, RefreshCw, QrCode, Smartphone, Send } from 'lucide-react';
import { payCustomerOrder } from '@/app/actions/payment';

const STATUS_CONFIG: Record<string, {
  label: string;
  desc: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
  step: number;
}> = {
  WAITING: {
    label: 'Menunggu Konfirmasi',
    desc: 'Pesananmu sudah masuk dan sedang menunggu konfirmasi dari dapur.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    icon: <Clock className="w-8 h-8 text-orange-500" />,
    step: 0,
  },
  COOKING: {
    label: 'Sedang Dimasak 👨‍🍳',
    desc: 'Koki kami sedang menyiapkan hidangan spesialmu! Mohon tunggu sebentar.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: <ChefHat className="w-8 h-8 text-blue-500" />,
    step: 1,
  },
  READY: {
    label: 'Siap Disajikan! 🍽️',
    desc: 'Pesananmu sudah siap! Pelayan akan segera mengantarkan ke mejamu.',
    color: 'text-green-600',
    bg: 'bg-green-50',
    icon: <CheckCircle2 className="w-8 h-8 text-green-500" />,
    step: 2,
  },
  SERVED: {
    label: 'Sudah Disajikan ✅',
    desc: 'Pesananmu sudah tersaji. Selamat menikmati! Terima kasih sudah memesan.',
    color: 'text-zinc-600',
    bg: 'bg-zinc-50',
    icon: <Star className="w-8 h-8 text-amber-400" />,
    step: 3,
  },
};

const STEPS = ['WAITING', 'COOKING', 'READY', 'SERVED'];

export default function OrderTracker({ orderId, tenant, primaryColor }: { orderId: string; tenant: string; primaryColor: string }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [payingMethod, setPayingMethod] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  async function handlePayment(method: string) {
    setIsPaying(true);
    try {
      await payCustomerOrder(orderId, method);
      setOrder((prev: any) => ({ ...prev, paymentStatus: 'PAID', paymentMethod: method }));
      setPayingMethod(null);
    } catch (e) {
      alert('Gagal mengonfirmasi pembayaran.');
    } finally {
      setIsPaying(false);
    }
  }

  async function handleFeedback(e: React.FormEvent) {
    e.preventDefault();
    // Simulate sending feedback
    setFeedbackSent(true);
  }

  async function fetchStatus() {
    try {
      const res = await fetch(`/api/order-status/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setLastUpdated(new Date());
      }
    } catch (e) {
      // silent fail — keep showing last known state
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
    // Poll every 10 seconds
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin w-10 h-10 border-4 border-zinc-200 border-t-zinc-900 rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 text-center px-4">
        <p className="text-zinc-900 font-bold text-xl mb-2">Pesanan tidak ditemukan</p>
        <p className="text-zinc-500 mb-6">ID pesanan tidak valid atau sudah kedaluwarsa.</p>
        <Link href={`/${tenant}/menu`} className="px-6 py-3 rounded-xl font-bold text-white" style={{ backgroundColor: primaryColor }}>Kembali ke Menu</Link>
      </div>
    );
  }

  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.WAITING;
  const currentStep = config.step;
  const totalAmount = order.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-zinc-50 pb-16">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur shadow-sm sticky top-0 z-40 px-4 py-3 flex items-center gap-3">
        <Link href={`/menu`} className="p-2 rounded-xl hover:bg-zinc-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-600" />
        </Link>
        <h1 className="font-bold text-zinc-900 flex-1">Status Pesanan</h1>
        <button onClick={fetchStatus} className="p-2 rounded-xl hover:bg-zinc-100 transition-colors" title="Refresh">
          <RefreshCw className="w-4 h-4 text-zinc-500" />
        </button>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Status Card */}
        <div className={`${config.bg} rounded-3xl p-8 text-center border border-white shadow-lg`}>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            {config.icon}
          </div>
          <h2 className={`text-2xl font-black mb-2 ${config.color}`}>{config.label}</h2>
          <p className="text-zinc-600 max-w-xs mx-auto leading-relaxed">{config.desc}</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
          <div className="relative flex items-start justify-between">
            {/* Progress line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-zinc-100 z-0" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-green-400 z-0 transition-all duration-700"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((s, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <div key={s} className="flex flex-col items-center gap-2 z-10 flex-1">
                  <div className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow text-xs font-bold transition-all duration-500 ${done ? 'bg-green-500 text-white' : 'bg-zinc-200 text-zinc-400'} ${active ? 'ring-4 ring-green-200' : ''}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs text-center font-semibold max-w-[60px] leading-tight ${done ? 'text-zinc-800' : 'text-zinc-400'}`}>
                    {['Diterima', 'Memasak', 'Siap', 'Tersaji'][i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-50 flex justify-between items-center">
            <p className="font-bold text-zinc-900">Meja {order.tableNumber || '—'}</p>
            <p className="text-xs text-zinc-400">
              {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="p-5 space-y-3">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-zinc-100" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 flex-shrink-0 flex items-center justify-center text-zinc-300 text-xs font-bold">IMG</div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-zinc-900">{item.name}</p>
                  <p className="text-sm text-zinc-400">{formatIDR(item.price)} × {item.quantity}</p>
                </div>
                <p className="font-bold text-zinc-700 text-sm">{formatIDR(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-zinc-100 px-5 py-4 flex justify-between items-center">
            <span className="font-bold text-zinc-700">Total (incl. PPN 10%)</span>
            <span className="font-black text-zinc-900 text-lg">{formatIDR(totalAmount * 1.1)}</span>
          </div>
        </div>

        {/* PAYMENT SECTION */}
        {order.paymentStatus === 'PENDING' && (
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-zinc-900">Pilih Metode Pembayaran</h3>
            </div>
            
            {payingMethod ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-48 h-48 mx-auto bg-zinc-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-300">
                  <QrCode className="w-16 h-16 text-zinc-300" />
                  <span className="absolute text-zinc-500 font-bold text-sm bg-white px-2">Dummy {payingMethod}</span>
                </div>
                <p className="text-sm text-zinc-600">
                  Silakan scan QR di atas atau transfer ke rekening BCA 1234567890 a/n Kasir.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setPayingMethod(null)} disabled={isPaying} className="flex-1 py-3 font-bold rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors">
                    Batal
                  </button>
                  <button onClick={() => handlePayment(payingMethod)} disabled={isPaying} className="flex-1 py-3 font-bold text-white rounded-xl shadow-md transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2" style={{ backgroundColor: primaryColor }}>
                    {isPaying ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : 'Selesai Bayar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 grid grid-cols-2 gap-3">
                <button onClick={() => setPayingMethod('QRIS')} className="py-4 border-2 border-zinc-200 rounded-xl font-bold flex flex-col items-center gap-2 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <QrCode className="w-6 h-6 text-blue-500" /> QRIS
                </button>
                <button onClick={() => setPayingMethod('TRANSFER')} className="py-4 border-2 border-zinc-200 rounded-xl font-bold flex flex-col items-center gap-2 hover:border-green-500 hover:bg-green-50 transition-colors">
                  <Smartphone className="w-6 h-6 text-green-500" /> Transfer
                </button>
              </div>
            )}
          </div>
        )}

        {order.paymentStatus === 'PAID' && (
          <div className="bg-green-50 rounded-2xl border border-green-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-900">Pembayaran Berhasil Lunas 🎉</p>
                <p className="text-sm text-green-700">Metode: {order.paymentMethod} • Dapur sudah mengetahui ini.</p>
              </div>
            </div>
          </div>
        )}

        {/* FEEDBACK SECTION */}
        {order.status === 'SERVED' && !feedbackSent && (
          <form onSubmit={handleFeedback} className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
            <div className="text-center space-y-1">
              <Star className="w-8 h-8 text-amber-400 mx-auto fill-current" />
              <h3 className="font-bold text-zinc-900 text-lg">Bagaimana pesanan Anda?</h3>
              <p className="text-xs text-zinc-500">Berikan saran agar kami bisa lebih baik lagi.</p>
            </div>
            <textarea
              required minLength={5}
              placeholder="Makanan enak, pelayanan cepat..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <button type="submit" className="w-full bg-zinc-900 text-white font-bold py-3.5 rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Kirim Saran
            </button>
          </form>
        )}

        {order.status === 'SERVED' && feedbackSent && (
          <div className="text-center py-6">
            <p className="font-semibold text-zinc-500">Terima kasih atas masukan Anda! ❤️</p>
          </div>
        )}

        {/* Auto-refresh note */}
        <p className="text-center text-xs text-zinc-400">
          Halaman ini otomatis diperbarui setiap 10 detik · Terakhir: {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>

        <Link href={`/menu`} className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Menu
        </Link>
      </div>
    </div>
  );
}

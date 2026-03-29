'use client';

import { useState } from 'react';
import { formatIDR } from '@/lib/format';
import {
  Plus, Minus, Trash2, Banknote, CreditCard, Smartphone,
  CheckCircle2, RotateCcw, Search, Printer, Settings2,
  ShoppingCart, UtensilsCrossed
} from 'lucide-react';

type Menu = { id: string; name: string; price: number; discountPrice: number | null; imageUrl: string | null };
type Category = { id: string; name: string; menus: Menu[] };
type CartItem = Menu & { quantity: number };

const PAYMENT_METHODS = [
  { id: 'CASH', label: 'Tunai', icon: <Banknote className="w-4 h-4" /> },
  { id: 'TRANSFER', label: 'Transfer', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'QRIS', label: 'QRIS', icon: <CreditCard className="w-4 h-4" /> },
];

export default function CashierPOS({ restaurant }: { restaurant: any }) {
  const categories: Category[] = restaurant.categories;
  const tables = restaurant.tables;

  const [receiptConfig, setReceiptConfig] = useState({
    instagram: restaurant.instagram || '',
    tiktok: restaurant.tiktok || '',
    mapsUrl: restaurant.mapsUrl || restaurant.address || '',
    thankYouMessage: restaurant.thankYouMessage || 'Terima kasih sudah memesan! 🙏\nKunjungi kami lagi ya~',
    showLogo: true,
  });
  const [showReceiptSettings, setShowReceiptSettings] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [customerName, setCustomerName] = useState('Kasir');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [cashPaid, setCashPaid] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  // Mobile: 'menu' or 'cart'
  const [mobileTab, setMobileTab] = useState<'menu' | 'cart'>('menu');

  const displayMenus = categories
    .filter(c => activeCategory === 'all' || c.id === activeCategory)
    .flatMap(c => c.menus)
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  const addToCart = (menu: Menu) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === menu.id);
      if (ex) return prev.map(i => i.id === menu.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...menu, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0));
  };

  const subtotal = cart.reduce((s, i) => s + (i.discountPrice ?? i.price) * i.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  const cashPaidNum = parseFloat(cashPaid) || 0;
  const change = cashPaidNum - total;
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const resetPOS = () => {
    setCart([]);
    setSelectedTable('');
    setCustomerName('Kasir');
    setPaymentMethod('CASH');
    setCashPaid('');
    setShowReceipt(false);
    setMobileTab('menu');
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!selectedTable) { alert('Pilih meja atau pilih "Takeaway"'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/cashier-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          tableNumber: selectedTable,
          customerName,
          paymentMethod,
          items: cart.map(i => ({ id: i.id, quantity: i.quantity, price: i.discountPrice ?? i.price }))
        })
      });
      const data = await res.json();
      if (data.orderId) setShowReceipt(true);
    } catch {
      alert('Gagal memproses pesanan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  function printReceipt() {
    const printContents = document.getElementById('receipt-area')?.innerHTML;
    if (!printContents) return;
    const win = window.open('', '_blank', 'width=400,height=700');
    if (!win) return;
    win.document.write(`
      <html><head><title>Struk</title>
      <style>
        body { font-family: monospace; font-size: 12px; width: 280px; margin: 0 auto; padding: 10px; }
        .flex { display: flex; justify-content: space-between; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .border-t { border-top: 1px dashed #ccc; margin-top: 8px; padding-top: 8px; }
        .border-b { border-bottom: 1px dashed #ccc; margin-bottom: 8px; padding-bottom: 8px; }
        .text-xs { font-size: 10px; color: #555; }
        .font-black { font-weight: 900; font-size: 14px; }
        .text-green { color: #16a34a; font-weight:bold; }
      </style></head>
      <body>${printContents}</body></html>
    `);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); win.close(); }, 300);
  }

  // ── Receipt View ──────────────────────────────────────────────
  if (showReceipt) {
    return (
      <div className="max-w-sm mx-auto py-6 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-xl font-black text-zinc-900">Pembayaran Berhasil!</h1>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm text-left">
          <div id="receipt-area" className="p-5 font-mono text-sm space-y-3">
            <div className="text-center border-b border-dashed pb-3">
              {receiptConfig.showLogo && restaurant.logoUrl && (
                <img src={restaurant.logoUrl} alt="Logo" className="w-12 h-12 object-contain mx-auto mb-2 rounded-lg" />
              )}
              <p className="font-black text-base">{restaurant.name}</p>
              {restaurant.address && <p className="text-xs text-zinc-500">{restaurant.address}</p>}
              {restaurant.phone && <p className="text-xs text-zinc-500">📞 {restaurant.phone}</p>}
              {receiptConfig.instagram && <p className="text-xs text-zinc-500">📸 @{receiptConfig.instagram.replace('@', '')}</p>}
              {receiptConfig.tiktok && <p className="text-xs text-zinc-500">🎵 @{receiptConfig.tiktok.replace('@', '')}</p>}
              {receiptConfig.mapsUrl && <p className="text-xs text-blue-500">📍 {receiptConfig.mapsUrl.startsWith('http') ? 'Lihat Lokasi di Maps' : receiptConfig.mapsUrl}</p>}
              <p className="text-xs text-zinc-400 mt-1">{new Date().toLocaleString('id-ID')}</p>
            </div>
            <div className="text-xs text-zinc-500 flex gap-4">
              <span>Meja: <strong>{selectedTable}</strong></span>
              <span>Kasir: <strong>{customerName}</strong></span>
            </div>
            <div className="space-y-1 border-b border-dashed pb-3">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span>{item.quantity}x {item.name}</span>
                  <span>{formatIDR((item.discountPrice ?? item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-zinc-600"><span>Subtotal</span><span>{formatIDR(subtotal)}</span></div>
              <div className="flex justify-between text-zinc-600"><span>PPN 10%</span><span>{formatIDR(tax)}</span></div>
              <div className="flex justify-between font-black text-sm"><span>TOTAL</span><span>{formatIDR(total)}</span></div>
              {paymentMethod === 'CASH' && cashPaid && (
                <>
                  <div className="flex justify-between text-zinc-600"><span>Bayar</span><span>{formatIDR(cashPaidNum)}</span></div>
                  <div className="flex justify-between font-bold text-green-600"><span>Kembalian</span><span>{formatIDR(Math.max(0, change))}</span></div>
                </>
              )}
            </div>
            <div className="text-center text-xs text-zinc-400 border-t border-dashed pt-3 whitespace-pre-line">{receiptConfig.thankYouMessage}</div>
          </div>

          <div className="border-t p-3">
            <button onClick={() => setShowReceiptSettings(s => !s)} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-700 transition-colors font-medium">
              <Settings2 className="w-3 h-3" /> {showReceiptSettings ? 'Sembunyikan' : 'Kustomisasi struk'}
            </button>
            {showReceiptSettings && (
              <div className="pt-3 space-y-2 text-xs">
                <input value={receiptConfig.instagram} onChange={e => setReceiptConfig(c => ({ ...c, instagram: e.target.value }))} className="w-full px-2 py-1.5 rounded border border-zinc-200 text-xs" placeholder="Instagram (tanpa @)" />
                <input value={receiptConfig.tiktok} onChange={e => setReceiptConfig(c => ({ ...c, tiktok: e.target.value }))} className="w-full px-2 py-1.5 rounded border border-zinc-200 text-xs" placeholder="TikTok (tanpa @)" />
                <input value={receiptConfig.mapsUrl} onChange={e => setReceiptConfig(c => ({ ...c, mapsUrl: e.target.value }))} className="w-full px-2 py-1.5 rounded border border-zinc-200 text-xs" placeholder="Link Google Maps atau Alamat" />
                <textarea value={receiptConfig.thankYouMessage} onChange={e => setReceiptConfig(c => ({ ...c, thankYouMessage: e.target.value }))} rows={2} className="w-full px-2 py-1.5 rounded border border-zinc-200 text-xs" placeholder="Pesan terima kasih..." />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={printReceipt} className="flex-1 py-3 font-bold rounded-xl bg-zinc-900 text-white flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors text-sm">
            <Printer className="w-4 h-4" /> Cetak Struk
          </button>
          <button onClick={resetPOS} className="flex-1 py-3 font-bold rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors text-sm">
            <RotateCcw className="w-4 h-4" /> Transaksi Baru
          </button>
        </div>
      </div>
    );
  }

  // ── Menu Panel (shared between desktop+mobile) ────────────────
  const renderMenuPanel = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="p-3 bg-white border-b shadow-sm space-y-2 flex-shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari menu..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex-shrink-0 transition-all ${activeCategory === 'all' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-500 border-zinc-200'}`}
          >
            Semua
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border flex-shrink-0 transition-all ${activeCategory === c.id ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-500 border-zinc-200'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="flex-1 overflow-auto p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
          {displayMenus.map(menu => {
            const inCart = cart.find(i => i.id === menu.id);
            return (
              <button
                key={menu.id}
                onClick={() => { addToCart(menu); if (window.innerWidth < 768) { /* stay on menu tab, show badge */ } }}
                className="bg-white rounded-xl border border-zinc-200 p-2.5 text-left hover:border-zinc-900 hover:shadow-md transition-all active:scale-95 group relative"
              >
                <div className="w-full aspect-square rounded-lg mb-2 overflow-hidden bg-zinc-100 relative">
                  {menu.imageUrl ? (
                    <img src={menu.imageUrl} alt={menu.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UtensilsCrossed className="w-8 h-8 text-zinc-300" />
                    </div>
                  )}
                  {inCart && (
                    <div className="absolute top-1 right-1 w-6 h-6 bg-zinc-900 text-white rounded-full flex items-center justify-center text-xs font-black">
                      {inCart.quantity}
                    </div>
                  )}
                </div>
                <p className="font-semibold text-zinc-900 text-xs leading-tight line-clamp-2">{menu.name}</p>
                <p className="font-black text-zinc-700 text-xs mt-0.5">{formatIDR(menu.discountPrice ?? menu.price)}</p>
                {menu.discountPrice && (
                  <p className="text-[10px] text-zinc-400 line-through">{formatIDR(menu.price)}</p>
                )}
              </button>
            );
          })}
          {displayMenus.length === 0 && (
            <div className="col-span-full text-center py-12 text-zinc-400 text-sm">
              <p className="text-4xl mb-2">🍽️</p>
              <p>Tidak ada menu yang ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── Cart Panel (shared between desktop+mobile) ────────────────
  const renderCartPanel = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-black text-zinc-900 text-lg">Pesanan</h2>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-xs text-red-500 hover:text-red-700 transition-colors">Hapus Semua</button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-zinc-500 font-medium block mb-1">Meja</label>
            <select
              value={selectedTable}
              onChange={e => setSelectedTable(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="">Pilih Meja</option>
              <option value="takeaway">Takeaway</option>
              {tables.map((t: any) => (
                <option key={t.id} value={t.number}>Meja {t.number}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 font-medium block mb-1">Nama Pelanggan</label>
            <input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2 py-12">
            <ShoppingCart className="w-10 h-10 text-zinc-200" />
            <p className="text-sm font-medium">Pilih menu dari daftar</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-zinc-50 rounded-xl p-2.5">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900 text-sm truncate">{item.name}</p>
                  <p className="text-xs text-zinc-500">{formatIDR(item.discountPrice ?? item.price)} × {item.quantity} = <span className="font-bold text-zinc-700">{formatIDR((item.discountPrice ?? item.price) * item.quantity)}</span></p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full bg-zinc-200 hover:bg-zinc-300 flex items-center justify-center text-zinc-600 transition-colors">
                    {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
                  </button>
                  <span className="font-black text-sm w-5 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full bg-zinc-200 hover:bg-zinc-300 flex items-center justify-center text-zinc-600 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Panel */}
      <div className="border-t p-4 space-y-3 flex-shrink-0">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-zinc-500"><span>Subtotal</span><span>{formatIDR(subtotal)}</span></div>
          <div className="flex justify-between text-zinc-500"><span>PPN 10%</span><span>{formatIDR(tax)}</span></div>
          <div className="flex justify-between font-black text-zinc-900 text-base pt-1 border-t"><span>TOTAL</span><span>{formatIDR(total)}</span></div>
        </div>

        <div>
          <p className="text-xs text-zinc-500 font-medium mb-1.5">Metode Pembayaran</p>
          <div className="grid grid-cols-3 gap-1.5">
            {PAYMENT_METHODS.map(pm => (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id)}
                className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all border-2 ${paymentMethod === pm.id ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-400'}`}
              >
                {pm.icon}
                {pm.label}
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === 'CASH' && (
          <div>
            <label className="text-xs text-zinc-500 font-medium block mb-1">Uang Diterima</label>
            <input
              type="number"
              value={cashPaid}
              onChange={e => setCashPaid(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm font-bold outline-none focus:ring-2 focus:ring-zinc-900"
            />
            {cashPaidNum >= total && total > 0 && (
              <p className="text-green-600 font-bold text-sm mt-1">Kembalian: {formatIDR(change)}</p>
            )}
            {cashPaidNum > 0 && cashPaidNum < total && (
              <p className="text-red-500 font-bold text-sm mt-1">Kurang: {formatIDR(total - cashPaidNum)}</p>
            )}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={cart.length === 0 || loading || !selectedTable}
          className="w-full py-4 rounded-2xl font-black text-white text-base transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Proses Pembayaran · {formatIDR(total)}
            </>
          )}
        </button>
      </div>
    </div>
  );

  // ── MOBILE LAYOUT: Tab-based ──────────────────────────────────
  // ── DESKTOP LAYOUT: Side-by-side ─────────────────────────────
  return (
    <>
      {/* ── DESKTOP (lg+): Side-by-side ── */}
      <div className="hidden lg:flex h-[calc(100vh-8rem)] -m-4 sm:-m-6 lg:-m-8 overflow-hidden bg-zinc-50">
        <div className="flex-1 overflow-hidden bg-zinc-50">
          {renderMenuPanel()}
        </div>
        <div className="w-80 xl:w-96 bg-white border-l shadow-lg overflow-hidden">
          {renderCartPanel()}
        </div>
      </div>

      {/* ── MOBILE / TABLET (< lg): Tab layout ── */}
      <div className="flex flex-col lg:hidden h-[calc(100vh-8rem)] -m-3 sm:-m-4 overflow-hidden">
        {/* Tab header */}
        <div className="flex bg-white border-b flex-shrink-0 shadow-sm">
          <button
            onClick={() => setMobileTab('menu')}
            className={`flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${mobileTab === 'menu' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400'}`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            Pilih Menu
          </button>
          <button
            onClick={() => setMobileTab('cart')}
            className={`flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${mobileTab === 'cart' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400'}`}
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-zinc-900 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            Keranjang
            {cartCount > 0 && <span className="text-xs bg-zinc-100 px-2 py-0.5 rounded-full font-bold">{formatIDR(total)}</span>}
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden bg-zinc-50">
          {mobileTab === 'menu' ? (
            <div className="h-full flex flex-col">
              {renderMenuPanel()}
              {/* FAB: switch to cart when items added */}
              {cartCount > 0 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                  <button
                    onClick={() => setMobileTab('cart')}
                    className="bg-zinc-900 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3 hover:bg-zinc-800 transition-all active:scale-95 text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {cartCount} item · {formatIDR(total)}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full bg-white overflow-auto">
              {renderCartPanel()}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Search, Trash2, Loader2, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatIDR } from '@/lib/format';
import { createOrder } from '@/app/actions/order';

type Menu = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  isAvailable: boolean;
};

type Category = {
  id: string;
  name: string;
  menus: Menu[];
};

type CartItem = Menu & { quantity: number; notes: string };

export default function ClientMenu({ 
  categories, 
  tenant,
  table,
  primaryColor,
  restaurantId,
  restaurantPhone
}: { 
  categories: Category[];
  tenant: string;
  table: string;
  primaryColor: string;
  restaurantId: string;
  restaurantPhone?: string;
}) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<{name: string, phone: string} | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`tenant_${tenant}_customer`);
    if (saved) {
      setCustomerInfo(JSON.parse(saved));
      setShowWelcome(false);
    }
  }, [tenant]);

  const handleWelcomeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const info = { name: fd.get('name') as string, phone: fd.get('phone') as string };
    localStorage.setItem(`tenant_${tenant}_customer`, JSON.stringify(info));
    setCustomerInfo(info);
    setShowWelcome(false);
  };

  const filteredCategories = categories.map(cat => ({
    ...cat,
    menus: cat.menus.filter(menu => 
      menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (menu.description && menu.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(cat => cat.menus.length > 0);

  const displayCategories = activeCategory === 'all' 
    ? filteredCategories 
    : filteredCategories.filter(cat => cat.id === activeCategory);

  const addToCart = (menu: Menu) => {
    if (!menu.isAvailable) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === menu.id);
      if (existing) {
        return prev.map(item => item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...menu, quantity: 1, notes: '' }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + ((item.discountPrice ?? item.price) * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (!table) {
      alert("No table detected! Please scan the QR code on your table.");
      return;
    }

    setIsCheckingOut(true);
    try {
      const items = cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.discountPrice ?? item.price
      }));
      
      const result = await createOrder(restaurantId, table, customerInfo?.name || 'Guest', customerInfo?.phone || '', items);
      
      // Reset cart and show success overlay
      setCart([]);
      setIsCartOpen(false);
      setOrderId(result?.orderId || null);
      setShowSuccess(true);
    } catch (e) {
      alert("Gagal membuat pesanan. Silakan coba lagi atau hubungi pelayan.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // === ORDER SUCCESS SCREEN ===
  if (showSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white px-4 py-12 text-center">
        <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-bounce-in shadow-lg">
          <svg className="w-14 h-14 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-zinc-900 mb-2">Pesanan Masuk! 🎉</h1>
        <p className="text-zinc-500 text-lg mb-2">
          Terima kasih, <strong>{customerInfo?.name || 'Pelanggan'}</strong>!
        </p>
        <p className="text-zinc-500 mb-8 max-w-xs">
          Pesananmu sedang diproses oleh dapur kami. Harap tunggu sebentar ya! 😋
        </p>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-md px-8 py-4 mb-8 flex flex-col items-center gap-1.5">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Meja</p>
          <p className="text-4xl font-black text-zinc-900">{table || '—'}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          {orderId && (
            <button
              onClick={() => router.push(`/order/${orderId}`)}
              className="flex-1 py-4 font-bold rounded-2xl text-white shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              🍽️ Lacak Pesanan
            </button>
          )}
          <button
            onClick={() => setShowSuccess(false)}
            className="flex-1 py-4 font-bold rounded-2xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
          >
            Pesan Lagi
          </button>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-lg border border-zinc-100 text-center animate-bounce-in">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl border border-zinc-100">👋</div>
          <h2 className="text-2xl font-black text-zinc-900 mb-2">Welcome!</h2>
          <p className="text-zinc-500 mb-6 text-sm">Please tell us your name and phone number to start ordering.</p>
          <form onSubmit={handleWelcomeSubmit} className="space-y-4">
            <input name="name" type="text" placeholder="Your Full Name" required minLength={2} className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all" />
            <input name="phone" type="tel" placeholder="WhatsApp / Phone Number" required minLength={6} className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all" />
            <button type="submit" className="w-full py-3 mt-2 font-bold text-white rounded-xl shadow-md transition-transform hover:scale-[1.02] active:scale-95" style={{ backgroundColor: primaryColor }}>
              View Menu
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
        <input 
          type="text" 
          placeholder="Search for dishes, drinks..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border-none ring-1 ring-zinc-200 shadow-sm focus:ring-2 outline-none transition-all bg-white"
          style={{ outlineColor: primaryColor }}
        />
      </div>

      {/* Categories Tabs - Scrollable */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-2 scrollbar-hide sticky top-20 z-30 bg-zinc-50 pt-2 px-1">
        <button
          onClick={() => {
            setActiveCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all border`}
          style={{ 
            backgroundColor: activeCategory === 'all' ? primaryColor : 'white',
            color: activeCategory === 'all' ? 'white' : '#52525b',
            borderColor: activeCategory === 'all' ? primaryColor : '#e4e4e7'
          }}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
            }}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all border`}
            style={{ 
              backgroundColor: activeCategory === cat.id ? primaryColor : 'white',
              color: activeCategory === cat.id ? 'white' : '#52525b',
              borderColor: activeCategory === cat.id ? primaryColor : '#e4e4e7'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu List */}
      <div className="space-y-10 mt-6">
        {displayCategories.map(category => (
          <div key={category.id} id={category.id} className="scroll-mt-36">
            <h2 className="text-xl font-bold text-zinc-900 mb-4">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.menus.map(menu => (
                <div key={menu.id} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex gap-4 hover:border-zinc-300 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-bold text-zinc-900">{menu.name}</h3>
                    <p className="text-zinc-500 text-sm mt-1 line-clamp-2">{menu.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <p className="font-semibold" style={{ color: primaryColor }}>
                        {formatIDR(menu.discountPrice ?? menu.price)}
                      </p>
                      {menu.discountPrice && (
                        <p className="text-xs text-zinc-400 line-through">
                          <s className="text-xs text-zinc-400">{formatIDR(menu.price)}</s>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <div className="w-24 h-24 bg-zinc-100 rounded-xl overflow-hidden relative border border-zinc-100 object-cover">
                      {menu.imageUrl ? (
                        <img src={menu.imageUrl} alt={menu.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex justify-center items-center text-zinc-300 text-xs font-bold">NO IMG</div>
                      )}
                      {!menu.isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex justify-center items-center">
                          <span className="text-white text-xs font-bold px-2 py-1 bg-red-600 rounded">SOLD OUT</span>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => addToCart(menu)}
                      disabled={!menu.isAvailable}
                      className={`mt-3 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 transition-all
                        ${menu.isAvailable ? 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}`}
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500">No menu items found.</p>
          </div>
        )}
      </div>

      {/* Floating Buttons Container */}
      <div className="fixed bottom-6 right-4 md:right-10 flex flex-col gap-3 items-end z-40">
        
        {/* Call Waiter / WhatsApp Button */}
        {restaurantPhone && table && !isCartOpen && (
          <a 
            href={`https://wa.me/${restaurantPhone.replace(/\D/g, '')}?text=Halo,%20saya%20di%20Meja%20${table}%20dan%20butuh%20bantuan.`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-14 h-14 rounded-full bg-green-500 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-bounce-in"
            title="Panggil Pelayan"
          >
            <Phone className="w-6 h-6" />
          </a>
        )}

        {/* Cart Button */}
        {cartItemCount > 0 && !isCartOpen && (
          <button 
            onClick={() => setIsCartOpen(true)}
            className="px-5 py-3.5 rounded-full text-white font-bold shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all animate-bounce-in text-sm md:text-base md:px-6 md:py-4"
            style={{ backgroundColor: primaryColor }}
          >
            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
            <span>{cartItemCount} Item</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full border border-white/20">{formatIDR(cartTotal)}</span>
          </button>
        )}
      </div>

      {/* Cart — bottom sheet on mobile, right panel on desktop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end md:flex-row md:justify-end bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setIsCartOpen(false); }}
        >
          {/* Panel */}
          <div className="w-full md:w-96 max-h-[90vh] md:max-h-full md:h-full bg-white shadow-2xl flex flex-col rounded-t-3xl md:rounded-none animate-slide-up-mobile md:animate-slide-in-right">
            <div className="p-4 md:p-6 border-b flex justify-between items-center bg-zinc-50 rounded-t-3xl md:rounded-none">
              {/* Grab handle on mobile */}
              <div className="absolute left-1/2 -translate-x-1/2 top-2 w-10 h-1 bg-zinc-300 rounded-full md:hidden" />
              <h2 className="text-xl md:text-2xl font-black text-zinc-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" /> Pesananmu
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-9 h-9 bg-zinc-200 text-zinc-600 rounded-full flex items-center justify-center hover:bg-zinc-300 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-zinc-800">{item.name}</h4>
                    <p className="font-semibold text-zinc-600">{formatIDR(item.discountPrice ?? item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-zinc-100 rounded-full px-2 py-1 h-9">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm text-zinc-600 hover:text-zinc-900">
                      {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5" />}
                    </button>
                    <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm text-zinc-600 hover:text-zinc-900">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 md:p-6 bg-zinc-50 border-t space-y-3">
              <div className="flex justify-between text-zinc-600 text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">{formatIDR(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 text-sm">
                <span>PPN (10%)</span>
                <span className="font-semibold">{formatIDR(cartTotal * 0.1)}</span>
              </div>
              <div className="flex justify-between text-lg md:text-xl font-black text-zinc-900 pt-2 border-t">
                <span>Total</span>
                <span>{formatIDR(cartTotal * 1.1)}</span>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut || cart.length === 0}
                className="w-full py-4 text-white font-bold rounded-2xl shadow-lg mt-2 text-base md:text-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center gap-2 items-center disabled:opacity-75 disabled:active:scale-100"
                style={{ backgroundColor: primaryColor }}
              >
                {isCheckingOut ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Pesan Sekarang 🛎️'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes slide-in-right {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        }
        @keyframes slide-up-mobile {
          0% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
        .animate-slide-up-mobile {
          animation: slide-up-mobile 0.35s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        }
      `}</style>
    </div>
  );
}

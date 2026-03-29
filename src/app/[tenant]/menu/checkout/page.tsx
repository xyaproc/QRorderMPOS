'use client';

import { useState, use } from 'react';
import { CreditCard, Banknote, QrCode } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CheckoutPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get('table') || 'Takeaway';
  
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'TRANSFER' | 'CASH'>('QRIS');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Mock cart total for demo
  const cartTotal = 45.50;
  const tax = cartTotal * 0.1;
  const grandTotal = cartTotal + tax;

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      setErrorMsg("Please enter your name for the order.");
      return;
    }
    
    setErrorMsg('');
    setIsProcessing(true);
    
    try {
      // 1. Get Geolocation for Anti-Fake Order System
      let coordinates = null;
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          coordinates = { lat: position.coords.latitude, lng: position.coords.longitude };
        } catch (e) {
          console.warn("Geolocation denied or timed out. Proceeding without strict geo constraints.");
        }
      }

      // 2. Anti-Fake Order API Validation
      const res = await fetch('/api/validate-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: table,
          coordinates,
          sessionToken: 'mock-session-id-1234567890' // Would come from initial QR scan cookie
        })
      });

      const validation = await res.json();
      if (!validation.isValid) {
        setErrorMsg(validation.reason || "Order validation failed.");
        setIsProcessing(false);
        return;
      }

      // 3. Navigate to order status page
      router.push(`/${tenant}/order/12345?name=${encodeURIComponent(customerName)}`);
    } catch (error) {
      setErrorMsg("An error occurred during checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 font-sans text-zinc-900">
      <header className="bg-white shadow-sm sticky top-0 z-40 p-4 pt-6 border-b">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="font-bold text-xl">Checkout</h1>
          <p className="font-bold text-primary">${grandTotal.toFixed(2)}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-6 mt-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 space-y-4">
          <h2 className="font-bold text-lg mb-2">Order Details</h2>
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold border border-red-200">
              {errorMsg}
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-b border-zinc-100">
            <span className="text-zinc-600">Table Number</span>
            <span className="font-bold">{table}</span>
          </div>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Your Name</label>
              <input 
                type="text" 
                placeholder="e.g. John Doe" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 space-y-4">
          <h2 className="font-bold text-lg mb-2">Select Payment Method</h2>
          <div className="grid gap-3">
            <button 
              onClick={() => setPaymentMethod('QRIS')}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === 'QRIS' ? 'border-primary bg-primary/5' : 'border-zinc-200 hover:border-zinc-300'}`}
            >
              <QrCode className={`w-6 h-6 ${paymentMethod === 'QRIS' ? 'text-primary' : 'text-zinc-400'}`} />
              <div>
                <span className="block font-bold">QRIS</span>
                <span className="text-xs text-zinc-500">Gopay, OVO, ShopeePay, supported Banks</span>
              </div>
            </button>
            <button 
              onClick={() => setPaymentMethod('TRANSFER')}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === 'TRANSFER' ? 'border-primary bg-primary/5' : 'border-zinc-200 hover:border-zinc-300'}`}
            >
              <CreditCard className={`w-6 h-6 ${paymentMethod === 'TRANSFER' ? 'text-primary' : 'text-zinc-400'}`} />
              <div>
                <span className="block font-bold">Bank Transfer (VA)</span>
                <span className="text-xs text-zinc-500">BCA, Mandiri, BNI, BRI</span>
              </div>
            </button>
            <button 
              onClick={() => setPaymentMethod('CASH')}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === 'CASH' ? 'border-primary bg-primary/5' : 'border-zinc-200 hover:border-zinc-300'}`}
            >
              <Banknote className={`w-6 h-6 ${paymentMethod === 'CASH' ? 'text-primary' : 'text-zinc-400'}`} />
              <div>
                <span className="block font-bold">Cash to Cashier</span>
                <span className="text-xs text-zinc-500">Pay directly when finishing your meal</span>
              </div>
            </button>
          </div>
        </div>

        <button 
          onClick={handleCheckout}
          disabled={isProcessing}
          className="w-full py-4 bg-zinc-900 text-white font-black rounded-2xl shadow-lg mt-8 text-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100 flex justify-center items-center"
        >
          {isProcessing ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            `Pay $${grandTotal.toFixed(2)}`
          )}
        </button>
        <p className="text-center text-xs text-zinc-400 mt-4 leading-relaxed">
          By placing an order, you agree to our terms and conditions. The restaurant will process your order immediately.
        </p>
      </main>
    </div>
  );
}

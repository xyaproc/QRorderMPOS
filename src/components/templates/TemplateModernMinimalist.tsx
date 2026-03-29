'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Utensils, MapPin, Phone, ChefHat, Star } from 'lucide-react';
import { formatIDR } from '@/lib/format';

export default function TemplateModernMinimalist({ restaurant, tenant }: { restaurant: any, tenant: string }) {
  const { theme, categories } = restaurant;
  const primaryColor = theme?.primaryColor || '#18181b';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Extract a few featured items
  const allItems = categories.flatMap((c: any) => c.menus);
  const featured = allItems.slice(0, 6);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Sticky Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {restaurant.logoUrl ? (
              <img src={restaurant.logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover shadow-sm bg-white p-0.5" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-sm">
                <ChefHat className="w-6 h-6" />
              </div>
            )}
            <span className={`font-black text-xl tracking-tight transition-colors duration-300 ${scrolled ? 'text-zinc-900' : 'text-white drop-shadow-md'}`}>
              {restaurant.name}
            </span>
          </div>
          <Link 
            href="/menu" 
            className="px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all text-white flex items-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            Order Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={restaurant.bannerUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2000'} 
            alt="Hero Banner" 
            className="w-full h-full object-cover zoom-animation"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-zinc-900/40"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white mt-16 fade-in-up">
          {restaurant.logoUrl ? (
             <div className="w-28 h-28 mx-auto bg-white/10 backdrop-blur-xl p-2 rounded-[2rem] shadow-2xl border border-white/20 mb-8 float-animation">
               <img src={restaurant.logoUrl} alt="Logo" className="w-full h-full rounded-[1.5rem] object-cover" />
             </div>
          ) : (
             <div className="w-28 h-28 mx-auto bg-white/10 backdrop-blur-xl p-2 rounded-[2rem] shadow-2xl border border-white/20 mb-8 float-animation flex items-center justify-center">
               <ChefHat className="w-16 h-16 text-white" />
             </div>
          )}
          <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase mb-6 inline-block">
            Welcome to
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            {restaurant.name}
          </h1>
          <p className="text-lg md:text-2xl text-zinc-300 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
            {restaurant.description || 'Experience culinary excellence with every bite. Discover our carefully crafted menu served with passion.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/menu" 
              className="w-full sm:w-auto px-8 py-4 rounded-full font-black text-lg shadow-2xl hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-1 transition-all text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Utensils className="w-5 h-5" /> View Menu & Order
            </Link>
            <a href="#about" className="w-full sm:w-auto px-8 py-4 rounded-full font-black text-lg bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white border border-white/20">
              Our Story
            </a>
          </div>
        </div>
      </section>

      {/* Info Bar */}
      <div className="w-full bg-white border-b border-zinc-200 py-8 shadow-sm relative z-20 -mt-6 rounded-t-3xl">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address || restaurant.name)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 md:pr-6 md:justify-center group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-50 group-hover:scale-110 group-hover:bg-zinc-100 transition-all shadow-sm border border-zinc-100" style={{ color: primaryColor }}>
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-zinc-900 group-hover:underline">Location</p>
              <p className="text-zinc-500 text-sm line-clamp-1">{restaurant.address || 'Visit our amazing store'}</p>
            </div>
          </a>
          <div className="flex items-center gap-4 pt-6 md:pt-0 md:pl-6 md:justify-center group">
             <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-50 group-hover:scale-110 transition-transform" style={{ color: primaryColor }}>
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-zinc-900">Contact Us</p>
              <p className="text-zinc-500 text-sm">{restaurant.phone || '+1 234 567 890'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Menu */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 fade-in-up-delayed">
          <h2 className="text-4xl font-black text-zinc-900 mb-4 inline-flex items-center justify-center gap-3">
             <Star className="w-8 h-8" style={{ color: primaryColor, fill: primaryColor }} /> Signature Dishes
          </h2>
          <p className="text-zinc-500 text-lg">Curated masterpieces to delight your taste buds.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((item: any, i: number) => (
            <div key={item.id} className="bg-white rounded-3xl p-3 shadow-xl shadow-zinc-200/40 border border-zinc-100 hover:-translate-y-2 transition-all duration-300 group cursor-pointer" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="h-48 rounded-2xl overflow-hidden mb-4 relative bg-zinc-100">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex justify-center items-center text-zinc-300">No Image</div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur shadow-sm px-3 py-1.5 rounded-full font-black text-sm" style={{ color: primaryColor }}>
                  {formatIDR(item.discountPrice ?? item.price)}
                </div>
              </div>
              <div className="px-3 pb-3">
                <h3 className="font-black text-xl text-zinc-900 mb-1">{item.name}</h3>
                <p className="text-zinc-500 text-sm line-clamp-2 min-h-[40px]">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link 
            href="/menu" 
            className="inline-flex items-center gap-2 border-2 border-zinc-900 text-zinc-900 font-bold px-8 py-3.5 rounded-full hover:bg-zinc-900 hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            Explore Full Menu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* About / Story section */}
      <section id="about" className="py-24 bg-white border-t border-zinc-100 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
             <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-6" style={{ color: primaryColor }}>
               <ChefHat className="w-8 h-8" />
             </div>
             <h2 className="text-4xl font-black text-zinc-900">Crafting Moments, Serving Memories.</h2>
             <p className="text-lg text-zinc-500 leading-relaxed">
               {restaurant.description || 'Every dish is a story waiting to be told. We blend tradition with innovation to bring you an unparalleled dining experience.'}
             </p>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-zinc-200 to-transparent rounded-3xl translate-x-4 translate-y-4"></div>
            <div className="aspect-[4/3] rounded-3xl bg-zinc-100 relative z-10 overflow-hidden shadow-2xl border border-zinc-200">
               <img src={restaurant.bannerUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80'} className="w-full h-full object-cover" alt="Atmosphere" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-20 text-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-10" style={{ backgroundColor: primaryColor }}></div>
         <div className="relative z-10">
           <h2 className="text-4xl font-black text-zinc-900 mb-6">Hungry?</h2>
           <Link 
              href="/menu" 
              className="inline-flex items-center gap-2 font-black px-10 py-5 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.15)] hover:scale-110 active:scale-95 transition-all text-white text-xl"
              style={{ backgroundColor: primaryColor }}
            >
              Order Now <Utensils className="w-6 h-6 ml-2" />
            </Link>
         </div>
      </footer>

      <style jsx global>{`
        @keyframes zoom {
          from { transform: scale(1.05); }
          to { transform: scale(1); }
        }
        .zoom-animation {
          animation: zoom 10s ease-out forwards;
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up {
          animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .fade-in-up-delayed {
          opacity: 0;
          animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
        }
      `}</style>
    </div>
  );
}

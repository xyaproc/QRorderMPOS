import { MapPin, Phone, Clock } from 'lucide-react';

export default function TemplateDarkLuxury({ restaurant, tenant }: { restaurant: any, tenant: string }) {
  const primaryColor = restaurant.theme?.primaryColor || '#d4af37'; // Gold default

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-serif tracking-wide">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex flex-col items-center">
            {restaurant.logoUrl ? (
              <img src={restaurant.logoUrl} alt="Logo" className="h-12 object-contain" />
            ) : (
              <span className="font-bold text-3xl tracking-[0.2em] uppercase" style={{ color: primaryColor }}>{restaurant.name}</span>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-12 text-sm uppercase tracking-widest text-zinc-400">
            <a href="#about" className="hover:text-white transition-colors">Our Story</a>
            <a href="#menu" className="hover:text-white transition-colors">Cuisine</a>
            <a href="#location" className="hover:text-white transition-colors">Reservation</a>
          </nav>
          <a href={`/${tenant}/menu`} 
             className="px-8 py-3 text-black font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-all border border-transparent hover:border-white"
             style={{ backgroundColor: primaryColor }}>
            Order Online
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {restaurant.bannerUrl ? (
          <img src={restaurant.bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-zinc-900 opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <div className="z-10 text-center flex flex-col items-center max-w-4xl px-4 mt-20">
          <h2 className="text-sm uppercase tracking-[0.4em] text-zinc-400 mb-6">Welcome to</h2>
          <h1 className="text-5xl md:text-8xl font-medium tracking-widest uppercase text-white drop-shadow-2xl">
            {restaurant.name}
          </h1>
          <div className="w-24 h-px my-10" style={{ backgroundColor: primaryColor }} />
          <p className="text-xl md:text-3xl font-light text-zinc-300 italic tracking-wider">
            {restaurant.description || "A taste of elegance."}
          </p>
        </div>
      </section>

      {/* MENU HIGHLIGHTS */}
      <section id="menu" className="py-32 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-20 flex flex-col items-center">
          <h2 className="text-sm uppercase tracking-[0.3em] mb-4" style={{ color: primaryColor }}>Culinary Masterpieces</h2>
          <h3 className="text-4xl md:text-5xl uppercase tracking-widest font-light">Signature Dishes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
          {restaurant.categories?.[0]?.menus?.slice(0, 6).map((menu: any, idx: number) => (
             <div key={menu.id} className="group relative">
               <div className="flex justify-between items-baseline mb-2">
                 <h4 className="text-xl tracking-widest uppercase font-light text-white group-hover:text-amber-200 transition-colors">{menu.name}</h4>
                 <div className="flex-1 mx-4 border-b border-dashed border-zinc-700 relative -top-2"></div>
                 <span className="text-xl font-medium" style={{ color: primaryColor }}>${menu.price.toFixed(2)}</span>
               </div>
               <p className="text-zinc-500 font-sans font-light tracking-wide pr-12">{menu.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-24 text-center">
          <a href={`/${tenant}/menu`} className="inline-block px-12 py-4 border border-zinc-600 hover:border-white uppercase tracking-widest text-sm transition-all duration-300">
            View Full Menu
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="location" className="bg-zinc-950/80 border-t border-zinc-900 py-20 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          <div className="flex flex-col items-center">
            <MapPin className="w-6 h-6 mb-6" style={{ color: primaryColor }} />
            <h3 className="uppercase tracking-[0.2em] text-sm font-bold mb-4">Location</h3>
            <p className="text-zinc-400 font-sans font-light">{restaurant.address || "123 Elite Avenue"}</p>
          </div>
          <div className="flex flex-col items-center">
            <Clock className="w-6 h-6 mb-6" style={{ color: primaryColor }} />
            <h3 className="uppercase tracking-[0.2em] text-sm font-bold mb-4">Hours</h3>
            <p className="text-zinc-400 font-sans font-light">Dinner: 5pm - 11pm</p>
          </div>
          <div className="flex flex-col items-center">
            <Phone className="w-6 h-6 mb-6" style={{ color: primaryColor }} />
            <h3 className="uppercase tracking-[0.2em] text-sm font-bold mb-4">Reservations</h3>
            <p className="text-zinc-400 font-sans font-light">{restaurant.phone || "+123 456 7890"}</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-zinc-900 text-xs uppercase tracking-widest text-zinc-600 text-center font-sans">
          &copy; {new Date().getFullYear()} {restaurant.name}.
        </div>
      </footer>
    </div>
  );
}

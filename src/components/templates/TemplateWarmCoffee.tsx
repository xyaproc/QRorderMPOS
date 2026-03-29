import { MapPin, Phone, Clock } from 'lucide-react';

export default function TemplateWarmCoffee({ restaurant, tenant }: { restaurant: any, tenant: string }) {
  const primaryColor = restaurant.theme?.primaryColor || '#bd7d5c'; // Warm coffee brown

  return (
    <div className="flex flex-col min-h-screen bg-[#fcf9f2] text-stone-800 font-sans">
      {/* HEADER */}
      <header className="absolute top-0 w-full z-50 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex flex-col items-center">
            <span className="font-extrabold text-2xl tracking-tight" style={{ color: primaryColor }}>{restaurant.name}</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-semibold text-stone-600">
            <a href="#about" className="hover:text-stone-900 transition-colors">Our Roasts</a>
            <a href="#menu" className="hover:text-stone-900 transition-colors">Menu</a>
          </nav>
          <a href={`/${tenant}/menu`} 
             className="px-6 py-2 rounded-xl text-white font-bold shadow-md hover:-translate-y-1 transition-all"
             style={{ backgroundColor: primaryColor }}>
            Order Pick-up
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative w-full h-[70vh] flex items-center justify-center bg-[#f0e6d2] overflow-hidden rounded-b-[4rem] mx-2 mt-2 border-b-8 shadow-sm" style={{ borderColor: primaryColor }}>
        <div className="z-10 text-center flex flex-col items-center max-w-3xl px-4 mt-12">
          <h1 className="text-6xl md:text-8xl font-black text-stone-800 tracking-tighter leading-none mb-6">
            Coffee. <br/>
            <span style={{ color: primaryColor }}>Done Right.</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium text-stone-600 max-w-xl leading-relaxed">
            {restaurant.description || "Freshly roasted beans, crafted specifically to jumpstart your day."}
          </p>
        </div>
        
        {/* Decorative blobs */}
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-30" style={{ backgroundColor: primaryColor }}></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 bg-stone-500"></div>
      </section>

      {/* MENU */}
      <section id="menu" className="py-24 px-6 max-w-5xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl font-extrabold text-stone-800 tracking-tight">Today's Menu</h2>
            <p className="mt-2 text-stone-500 font-medium">Baked fresh every morning.</p>
          </div>
          <a href={`/${tenant}/menu`} className="font-bold border-b-2 hover:border-transparent transition-colors pb-1" style={{ color: primaryColor, borderColor: primaryColor }}>
            See All Items &rarr;
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {restaurant.categories?.[0]?.menus?.slice(0, 6).map((menu: any) => (
             <div key={menu.id} className="flex gap-4 p-4 rounded-2xl bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.15)] transition-shadow">
                <div className="w-24 h-24 rounded-xl relative overflow-hidden bg-stone-100 flex-shrink-0">
                  {menu.imageUrl && <img src={menu.imageUrl} alt={menu.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-stone-800 leading-tight">{menu.name}</h3>
                    <span className="font-black" style={{ color: primaryColor }}>${menu.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-stone-500 mt-1 line-clamp-2 leading-relaxed">{menu.description}</p>
                </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-900 text-stone-400 py-16 px-6 rounded-t-[3rem] mx-2 mb-2">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-3xl font-black tracking-tight text-white mb-8">{restaurant.name}</h2>
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <span className="flex items-center gap-2"><MapPin className="w-5 h-5"/> {restaurant.address || "Coffee Street"}</span>
            <span className="flex items-center gap-2"><Phone className="w-5 h-5"/> {restaurant.phone || "555-COFFEE"}</span>
          </div>
          <p className="text-stone-600 text-sm font-semibold">&copy; {new Date().getFullYear()} {restaurant.name}</p>
        </div>
      </footer>
    </div>
  );
}

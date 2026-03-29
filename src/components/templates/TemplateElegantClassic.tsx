import { MapPin, Phone, Clock } from 'lucide-react';

export default function TemplateElegantClassic({ restaurant, tenant }: { restaurant: any, tenant: string }) {
  const primaryColor = restaurant.theme?.primaryColor || '#1a365d'; // Classic Navy Blue

  return (
    <div className="bg-stone-100 min-h-screen font-serif text-stone-900 border-x-8 border-transparent max-w-[1600px] mx-auto overflow-hidden shadow-2xl relative" style={{ borderColor: primaryColor }}>
      {/* Decorative Top Border */}
      <div className="h-6 w-full absolute top-0 left-0" style={{ backgroundColor: primaryColor }}></div>

      {/* HEADER */}
      <header className="pt-16 pb-8 px-8 flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-widest text-center" style={{ color: primaryColor }}>
          {restaurant.name}
        </h1>
        <div className="flex items-center gap-6 mt-8 w-full max-w-3xl">
          <div className="h-px bg-stone-300 flex-1"></div>
          <nav className="flex items-center gap-8 uppercase tracking-widest text-xs font-bold text-stone-600">
            <a href="#menu" className="hover:text-stone-900 transition-colors">The Menu</a>
            <a href="#location" className="hover:text-stone-900 transition-colors">Location</a>
          </nav>
          <div className="h-px bg-stone-300 flex-1"></div>
        </div>
      </header>

      {/* HERO HERO / INTRO */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <p className="text-2xl italic text-stone-600 leading-relaxed">
          "{restaurant.description || "An establishment dedicated to the fine art of dining, where tradition meets culinary excellence."}"
        </p>
        <div className="mt-12">
          <a href={`/${tenant}/menu`} 
             className="inline-block px-12 py-4 uppercase tracking-[0.2em] font-bold text-sm text-white shadow-lg hover:bg-stone-800 transition-colors"
             style={{ backgroundColor: primaryColor }}>
            Order Online
          </a>
        </div>
      </section>

      {/* MENU */}
      <section id="menu" className="py-24 px-6 max-w-5xl mx-auto w-full border-t border-stone-300">
        <div className="text-center mb-16 relative">
          <h2 className="text-3xl uppercase tracking-widest font-bold bg-stone-100 inline-block px-8 relative z-10" style={{ color: primaryColor }}>
            À La Carte
          </h2>
          <div className="absolute top-1/2 left-0 w-full h-px bg-stone-300 -z-10"></div>
        </div>

        <div className="space-y-16">
          {restaurant.categories?.map((cat: any) => (
             <div key={cat.id}>
               <h3 className="text-2xl italic text-stone-600 text-center mb-10">{cat.name}</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
                 {cat.menus?.slice(0, 8).map((menu: any) => (
                   <div key={menu.id} className="flex justify-between items-baseline gap-4">
                     <div className="flex-1">
                       <h4 className="text-lg font-bold uppercase tracking-wide text-stone-800">{menu.name}</h4>
                       <p className="text-sm italic text-stone-500 mt-1">{menu.description}</p>
                     </div>
                     <span className="text-lg font-bold" style={{ color: primaryColor }}>${menu.price.toFixed(2)}</span>
                   </div>
                 ))}
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer id="location" className="border-t-4 border-double py-20 px-6 mt-12 bg-white text-center" style={{ borderColor: primaryColor }}>
        <h2 className="text-3xl uppercase tracking-widest font-bold mb-12" style={{ color: primaryColor }}>{restaurant.name}</h2>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-12 uppercase tracking-wide text-xs font-bold text-stone-600">
          <div>
            <h3 className="text-stone-400 mb-4 tracking-[0.2em]">Address</h3>
            <p className="leading-loose">{restaurant.address || "123 Classic Blvd, City"}</p>
          </div>
          <div>
            <h3 className="text-stone-400 mb-4 tracking-[0.2em]">Reservations</h3>
            <p className="leading-loose">{restaurant.phone || "+123 456 7890"}</p>
          </div>
          <div>
            <h3 className="text-stone-400 mb-4 tracking-[0.2em]">Hours</h3>
            <p className="leading-loose">Mon-Sun<br/>11:00 AM - 10:00 PM</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

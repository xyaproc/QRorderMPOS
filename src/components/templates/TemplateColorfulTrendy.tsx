import { MapPin, Phone, Clock, Sparkles } from 'lucide-react';

export default function TemplateColorfulTrendy({ restaurant, tenant }: { restaurant: any, tenant: string }) {
  const primaryColor = restaurant.theme?.primaryColor || '#ff4b4b'; // Vivid pinkish-red

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-800 font-sans overflow-x-hidden">
      {/* HEADER */}
      <header className="absolute top-0 w-full z-50 p-6">
        <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl rounded-full px-8 h-20 flex items-center justify-between shadow-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white shadow-inner" style={{ backgroundColor: primaryColor }}>
              {restaurant.name.charAt(0)}
            </div>
            <span className="font-black text-xl tracking-tight leading-none text-slate-900">{restaurant.name}</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-600">
            <a href="#about" className="hover:text-slate-900 transition-colors">Vibe</a>
            <a href="#menu" className="hover:text-slate-900 transition-colors">Eats</a>
          </nav>
          <a href={`/${tenant}/menu`} 
             className="px-6 py-2.5 rounded-full text-white font-black text-sm shadow-[0_4px_15px_-3px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.4)] transition-all active:scale-95"
             style={{ backgroundColor: primaryColor, boxShadow: `0 4px 15px -3px ${primaryColor}80` }}>
            Grab a Bite
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative w-full min-h-screen flex items-center justify-center pt-32 pb-20 px-6">
        {/* Colorful background shapes */}
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-pulse" style={{ backgroundColor: primaryColor }}></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-60 bg-amber-300"></div>
        <div className="absolute top-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full mix-blend-multiply filter blur-[80px] opacity-50 bg-sky-300"></div>
        
        <div className="z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto w-full">
          <div className="text-left flex flex-col items-start relative">
            <Sparkles className="absolute -top-8 -left-8 w-12 h-12 animate-bounce" style={{ color: primaryColor }} />
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[1.05]">
              Crave.<br/>Eat.<br/>Repeat.
            </h1>
            <p className="mt-8 text-xl font-bold text-slate-600 max-w-lg leading-relaxed">
              {restaurant.description || "The most vibrant flavors in town, served fresh and fast."}
            </p>
            <div className="mt-12 flex gap-4 w-full sm:w-auto">
              <a href={`/${tenant}/menu`} className="flex-1 sm:flex-none text-center px-10 py-5 text-white font-black rounded-full text-lg shadow-xl hover:-translate-y-1 transition-transform active:scale-95 bg-slate-900 hover:bg-slate-800">
                Menu &rarr;
              </a>
            </div>
          </div>
          
          <div className="relative h-[60vh] w-full rounded-[3rem] overflow-hidden shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-700 bg-slate-100">
            {restaurant.bannerUrl && (
              <img src={restaurant.bannerUrl} alt="Vibe" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 border-[1rem] border-white/20 rounded-[3rem]"></div>
          </div>
        </div>
      </section>

      {/* MENU HIGHLIGHTS */}
      <section id="menu" className="py-32 px-6 w-full relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-20">
            <div className="px-4 py-2 rounded-full font-black text-sm mb-6 uppercase tracking-widest inline-block" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
              Top Picks
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">Trending Items</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {restaurant.categories?.[0]?.menus?.slice(0, 3).map((menu: any, idx: number) => (
               <div key={menu.id} className="relative group bg-slate-50 rounded-[2.5rem] p-4 pb-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 border-slate-100">
                  <div className="aspect-[4/3] rounded-[2rem] bg-slate-200 overflow-hidden mb-6 relative">
                    {menu.imageUrl && <img src={menu.imageUrl} alt={menu.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                    <div className="absolute top-4 right-4 bg-white text-slate-900 font-black px-4 py-2 rounded-full shadow-lg text-lg">
                      ${menu.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="px-4 text-center">
                    <h3 className="font-black text-2xl text-slate-900 mb-2">{menu.name}</h3>
                    <p className="text-slate-500 font-medium line-clamp-2">{menu.description}</p>
                  </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-24 px-6 border-t-[16px]" style={{ borderColor: primaryColor }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-white mb-4">{restaurant.name}</h2>
            <p className="text-slate-500 font-medium max-w-sm">{restaurant.description || "Good vibes and great food perfectly blended."}</p>
          </div>
          <div className="flex flex-col gap-4 font-bold text-lg text-white">
            <a href={`/${tenant}/menu`} className="hover:text-slate-300 transition-colors">Menu</a>
            <a href="#about" className="hover:text-slate-300 transition-colors">Our Vibe</a>
            <p className="text-slate-500 font-semibold mt-4 text-sm">&copy; {new Date().getFullYear()} All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

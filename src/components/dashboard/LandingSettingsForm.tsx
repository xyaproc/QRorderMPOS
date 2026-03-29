'use client';

import { useState } from 'react';
import { Save, Image as ImageIcon, Palette, Plus, Loader2 } from 'lucide-react';
import { updateLandingSettings } from '@/app/actions/dashboard';
import { useRouter } from 'next/navigation';

export default function LandingSettingsForm({ restaurant }: { restaurant: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(restaurant.theme?.templateName || 'modern-minimalist');
  const [primaryColor, setPrimaryColor] = useState(restaurant.theme?.primaryColor || '#000000');
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  async function handleSave(formData: FormData) {
    setLoading(true);
    let finalLogoUrl = restaurant.logoUrl || '';
    let finalBannerUrl = restaurant.bannerUrl || '';

    // Handle Logo Upload
    if (logoFile) {
      const uploadData = new FormData();
      uploadData.append('file', logoFile);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
        const data = await res.json();
        if (data.url) finalLogoUrl = data.url;
      } catch (e) { console.error('Logo upload failed', e); }
    }

    // Handle Banner Upload
    if (bannerFile) {
      const uploadData = new FormData();
      uploadData.append('file', bannerFile);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
        const data = await res.json();
        if (data.url) finalBannerUrl = data.url;
      } catch (e) { console.error('Banner upload failed', e); }
    }

    await updateLandingSettings(restaurant.id, {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      logoUrl: finalLogoUrl,
      bannerUrl: finalBannerUrl,
      templateName: activeTemplate,
      primaryColor: primaryColor
    });

    setLoading(false);
    
    // Refresh the router to reflect new state
    router.refresh();
  }

  return (
    <form action={handleSave} className="space-y-8 pb-10">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Landing Page Builder</h1>
          <p className="text-zinc-500 mt-1">Customize your public storefront and branding.</p>
        </div>
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-zinc-900 text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm hover:shadow-md hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* General info */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50">
              <h2 className="font-bold text-lg text-zinc-800">General Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Restaurant Name</label>
                <input name="name" type="text" defaultValue={restaurant.name} required className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Description / Tagline</label>
                <textarea name="description" rows={3} defaultValue={restaurant.description || ''} className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Address</label>
                  <input name="address" type="text" defaultValue={restaurant.address || ''} className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Phone Number</label>
                  <input name="phone" type="text" defaultValue={restaurant.phone || ''} className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-zinc-400" />
              <h2 className="font-bold text-lg text-zinc-800">Media</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Logo</label>
                <div className="relative w-32 h-32 rounded-xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-400 hover:bg-zinc-50 hover:border-zinc-900 transition-all cursor-pointer group">
                  {logoFile ? (
                    <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" className="w-full h-full object-contain rounded-xl absolute inset-0 z-0 p-2" />
                  ) : restaurant.logoUrl ? (
                    <img src={restaurant.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-xl absolute inset-0 z-0 p-2" />
                  ) : (
                    <div className="text-center z-10 pointer-events-none">
                      <Plus className="w-8 h-8 mx-auto mb-1 group-hover:text-zinc-900 transition-colors" />
                      <span className="text-xs font-medium group-hover:text-zinc-900 transition-colors">Upload</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Hero Banner</label>
                <div className="relative w-full h-32 rounded-xl border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 hover:bg-zinc-50 hover:border-zinc-900 transition-all cursor-pointer overflow-hidden group">
                  {bannerFile ? (
                    <img src={URL.createObjectURL(bannerFile)} alt="Banner Preview" className="w-full h-full object-cover absolute inset-0 z-0" />
                  ) : restaurant.bannerUrl ? (
                    <img src={restaurant.bannerUrl} alt="Banner" className="w-full h-full object-cover absolute inset-0 z-0" />
                  ) : (
                    <div className="text-center relative z-10 pointer-events-none">
                      <Plus className="w-8 h-8 mx-auto mb-1 group-hover:text-zinc-900 transition-colors" />
                      <span className="text-xs font-medium group-hover:text-zinc-900 transition-colors">Upload Banner Image</span>
                    </div>
                  )}
                   <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Templates and Theming */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-2">
              <Palette className="w-5 h-5 text-zinc-400" />
              <h2 className="font-bold text-lg text-zinc-800">Theme Template</h2>
            </div>
            <div className="p-4 grid grid-cols-1 gap-3">
              {[
                { id: 'modern-minimalist', name: 'Modern Minimalist', description: 'Clean, bright, and premium', emoji: '⚡', accent: 'from-zinc-900 to-zinc-700' },
                { id: 'dark-luxury',       name: 'Dark Luxury',       description: 'Elegant dark mood',        emoji: '🖤', accent: 'from-zinc-800 to-zinc-950' },
                { id: 'warm-coffee',       name: 'Warm Coffee',       description: 'Cozy café atmosphere',     emoji: '☕', accent: 'from-amber-800 to-amber-900' },
                { id: 'colorful-trendy',   name: 'Colorful Trendy',   description: 'Bold and vibrant',         emoji: '🌈', accent: 'from-violet-600 to-pink-500' },
                { id: 'elegant-classic',   name: 'Elegant Classic',   description: 'Timeless sophistication',  emoji: '🎩', accent: 'from-stone-700 to-stone-900' },
              ].map(t => (
                <div
                  key={t.id}
                  onClick={() => setActiveTemplate(t.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                    activeTemplate === t.id
                      ? 'border-zinc-900 bg-zinc-900/5 shadow-sm'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  {/* Color swatch */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.accent} flex items-center justify-center text-xl flex-shrink-0 shadow-sm`}>
                    {t.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-900">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    activeTemplate === t.id ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300'
                  }`}>
                    {activeTemplate === t.id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                </div>
              ))}

              <div className="pt-4 mt-1 border-t border-zinc-100">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                  <span className="text-sm font-mono text-zinc-600 bg-zinc-100 px-2 py-1 rounded">{primaryColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

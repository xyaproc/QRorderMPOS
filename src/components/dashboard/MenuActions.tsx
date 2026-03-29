'use client';

import { useState } from 'react';
import { Edit, Trash2, Save } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { deleteMenuItem } from '@/app/actions/dashboard';
// We will need a new server action to edit the menu
import { editMenuItem } from '@/app/actions/dashboard';

export default function MenuActions({ menu }: { menu: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  async function handleEdit(formData: FormData) {
    setLoading(true);
    let imageUrl = menu.imageUrl;

    if (file) {
      const uploadData = new FormData();
      uploadData.append('file', file);
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });
        const data = await res.json();
        if (data.url) {
          imageUrl = data.url;
        }
      } catch (err) {
        console.error("Image upload failed", err);
      }
    } else {
      imageUrl = formData.get('imageUrl') as string;
    }

    const rawDiscount = formData.get('discountPrice') as string;
    const discountPrice = rawDiscount ? parseFloat(rawDiscount) : null;

    await editMenuItem(menu.id, {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      discountPrice,
      description: formData.get('description') as string,
      imageUrl: imageUrl,
    });
    setLoading(false);
    setIsEditOpen(false);
    setFile(null); // Reset
  }

  return (
    <>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 items-end">
        <button onClick={() => setIsEditOpen(true)} type="button" className="p-1.5 text-zinc-400 hover:text-primary transition-colors hover:bg-white rounded shadow-sm border border-transparent hover:border-zinc-200">
          <Edit className="w-3.5 h-3.5" />
        </button>
        <form action={deleteMenuItem.bind(null, menu.id)}>
          <button type="submit" className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors hover:bg-white rounded shadow-sm border border-transparent hover:border-zinc-200">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Menu Item">
        <form action={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Item Name</label>
            <input name="name" defaultValue={menu.name} required className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-zinc-900" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Price ($)</label>
              <input type="number" step="0.01" name="price" defaultValue={menu.price} required className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-zinc-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Discount Price (Optional)</label>
              <input type="number" step="0.01" name="discountPrice" defaultValue={menu.discountPrice || ''} placeholder="e.g. 2.99" className="w-full px-3 py-2 border border-green-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
            <textarea name="description" defaultValue={menu.description || ''} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Image (Upload or URL)</label>
            <div className="flex flex-col gap-2">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" 
              />
              <input name="imageUrl" defaultValue={menu.imageUrl || ''} placeholder="Or paste an image URL here..." className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
          </div>
          <button disabled={loading} type="submit" className="w-full flex justify-center items-center gap-2 bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors">
            {loading ? 'Saving...' : <><Save className="w-4 h-4"/> Save Changes</>}
          </button>
        </form>
      </Modal>
    </>
  );
}

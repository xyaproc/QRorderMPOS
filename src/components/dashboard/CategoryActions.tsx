'use client';

import { useState } from 'react';
import { Edit, Check, X } from 'lucide-react';
import { renameCategory } from '@/app/actions/dashboard';

export default function CategoryActions({ category }: { category: { id: string; name: string } }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim() || name === category.name) { setEditing(false); return; }
    setSaving(true);
    await renameCategory(category.id, name.trim());
    setSaving(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setName(category.name); setEditing(false); } }}
          className="text-xl font-bold text-zinc-800 border-b-2 border-zinc-900 outline-none bg-transparent px-1 py-0.5 min-w-[120px]"
        />
        <button onClick={save} disabled={saving} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
          <Check className="w-4 h-4" />
        </button>
        <button onClick={() => { setName(category.name); setEditing(false); }} className="p-1.5 text-zinc-400 hover:bg-zinc-100 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-2 group/rename"
      title="Click to rename category"
    >
      <span className="text-xl font-bold text-zinc-800 group-hover/rename:text-zinc-600 transition-colors">
        {category.name}
      </span>
      <Edit className="w-3.5 h-3.5 text-zinc-300 group-hover/rename:text-zinc-500 transition-colors" />
    </button>
  );
}

'use client';

import { useState } from 'react';
import { Users, Store, ShoppingBag, Plus, Shield, UserCheck, Trash2, Eye, EyeOff } from 'lucide-react';

export default function SuperAdminClient({ tenants, users, totalOrders }: {
  tenants: any[];
  users: any[];
  totalOrders: number;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'RESTAURANT' });

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat user');
      setShowCreateUser(false);
      setForm({ name: '', email: '', password: '', role: 'RESTAURANT' });
      window.location.reload();
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  }

  const roleColors: Record<string, string> = {
    SUPERADMIN: 'bg-purple-900/40 text-purple-300 border border-purple-800/50',
    RESTAURANT: 'bg-blue-900/40 text-blue-300 border border-blue-800/50',
    STAFF: 'bg-green-900/40 text-green-300 border border-green-800/50',
    USER: 'bg-zinc-800 text-zinc-400',
  };

  return (
    <div className="space-y-8 min-h-screen bg-black p-6 lg:p-8 -m-6 lg:-m-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">System Overview</h1>
          <p className="text-zinc-400 mt-1">Manage all SaaS tenants and users.</p>
        </div>
        <button
          onClick={() => { setActiveTab('users'); setShowCreateUser(true); }}
          className="flex items-center gap-2 bg-white text-zinc-900 font-bold py-2.5 px-5 rounded-xl hover:bg-zinc-100 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Tambah User
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"><Store className="w-5 h-5 text-blue-400" /></div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Restoran</p>
          </div>
          <p className="text-3xl font-black text-white">{tenants.length}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center"><Users className="w-5 h-5 text-purple-400" /></div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Users</p>
          </div>
          <p className="text-3xl font-black text-white">{users.length}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-green-400" /></div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Pesanan</p>
          </div>
          <p className="text-3xl font-black text-white">{totalOrders}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[{ key: 'overview', label: 'Restoran' }, { key: 'users', label: 'Manajemen User' }].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-2 rounded-full font-bold text-sm border transition-all ${activeTab === tab.key ? 'bg-white text-zinc-900 border-white' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-black text-white mb-6">Buat User Baru</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1 block">Nama Lengkap</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-zinc-400 text-sm" placeholder="Nama Owner / Staff" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1 block">Email</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-zinc-400 text-sm" placeholder="email@domain.com" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1 block">Password</label>
                <div className="relative">
                  <input required type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-zinc-400 text-sm pr-10" placeholder="Min. 8 karakter" />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-bold mb-1 block">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-zinc-400 text-sm">
                  <option value="RESTAURANT">RESTAURANT (Pemilik)</option>
                  <option value="STAFF">STAFF (Kasir / Dapur)</option>
                  <option value="SUPERADMIN">SUPERADMIN</option>
                </select>
                <p className="text-xs text-zinc-500 mt-1">• RESTAURANT = akses dashboard penuh · STAFF = kasir & dapur saja · SUPERADMIN = akses sistem penuh</p>
              </div>
              {createError && <p className="text-red-400 text-sm bg-red-900/30 px-3 py-2 rounded-lg">{createError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateUser(false)} className="flex-1 py-3 rounded-xl font-bold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Batal</button>
                <button type="submit" disabled={createLoading} className="flex-1 py-3 rounded-xl font-bold bg-white text-zinc-900 hover:bg-zinc-100 transition-colors disabled:opacity-50">
                  {createLoading ? 'Membuat...' : 'Buat User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overview Tab: Tenant Table */}
      {activeTab === 'overview' && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800 bg-black/20">
            <h3 className="font-bold text-lg text-white">Daftar Restoran</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-widest">
                  <th className="p-4">Restoran</th>
                  <th className="p-4">Subdomain</th>
                  <th className="p-4">Email Owner</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant: any) => (
                  <tr key={tenant.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 font-bold text-zinc-200">{tenant.name}</td>
                    <td className="p-4 text-zinc-400 font-mono text-sm">{tenant.subdomain}.localhost</td>
                    <td className="p-4 text-zinc-400">{tenant.owner?.email}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-900/40 text-green-400 border border-green-800/50">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800 bg-black/20 flex justify-between items-center">
            <h3 className="font-bold text-lg text-white">Manajemen User</h3>
            <button onClick={() => setShowCreateUser(true)} className="flex items-center gap-2 text-sm font-bold text-white bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Tambah User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-widest">
                  <th className="p-4">Nama</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Restoran</th>
                  <th className="p-4">Bergabung</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center font-black text-zinc-300 text-sm">
                          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-zinc-200">{user.name || '—'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-400 text-sm">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${roleColors[user.role] || roleColors.USER}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400 text-sm">
                      {user.restaurants?.length > 0 ? user.restaurants.map((r: any) => r.name).join(', ') : '—'}
                    </td>
                    <td className="p-4 text-zinc-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

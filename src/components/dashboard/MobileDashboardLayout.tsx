'use client';

import Link from 'next/link';
import { Coffee, LayoutDashboard, QrCode, Settings, UtensilsCrossed, Palette, FileText, ChefHat, Banknote, Menu, X } from 'lucide-react';
import { useState } from 'react';
import LogoutButton from '@/components/ui/LogoutButton';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', section: 'manage' },
  { href: '/dashboard/menu', icon: Coffee, label: 'Menu', section: 'manage' },
  { href: '/dashboard/tables', icon: QrCode, label: 'Tables & QR', section: 'manage' },
  { href: '/dashboard/kitchen', icon: ChefHat, label: 'Kitchen Display', section: 'manage' },
  { href: '/dashboard/cashier', icon: Banknote, label: 'Kasir / POS', section: 'manage' },
  { href: '/dashboard/reports', icon: FileText, label: 'Income Reports', section: 'manage' },
  { href: '/dashboard/landing', icon: Palette, label: 'Landing Page', section: 'storefront' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', section: 'storefront' },
];

function NavLink({ href, icon: Icon, label, onClick }: { href: string; icon: any; label: string; onClick?: () => void }) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="flex items-center px-6 py-3 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors font-medium rounded-lg mx-2"
      >
        <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
        {label}
      </Link>
    </li>
  );
}

export default function MobileDashboardLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const manageItems = NAV_ITEMS.filter(n => n.section === 'manage');
  const storefrontItems = NAV_ITEMS.filter(n => n.section === 'storefront');

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b flex-shrink-0">
        <UtensilsCrossed className="w-6 h-6 mr-2 text-primary" />
        <h1 className="text-lg font-bold text-zinc-800">RestaurantOS</h1>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-4 mb-2">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Manage</p>
        </div>
        <ul className="space-y-0.5">
          {manageItems.map(item => (
            <NavLink key={item.href} {...item} onClick={() => setSidebarOpen(false)} />
          ))}
        </ul>
        <div className="px-4 mt-6 mb-2">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Storefront</p>
        </div>
        <ul className="space-y-0.5">
          {storefrontItems.map(item => (
            <NavLink key={item.href} {...item} onClick={() => setSidebarOpen(false)} />
          ))}
        </ul>
      </nav>
    </>
  );

  return (
    <div className="flex bg-zinc-50 min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r hidden lg:flex flex-col shadow-sm flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col z-10">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-lg hover:bg-zinc-100 text-zinc-500"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-14 md:h-16 bg-white border-b flex items-center px-4 md:px-6 justify-between shadow-sm sticky top-0 z-40 text-zinc-800">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-zinc-100 transition-colors lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-zinc-600" />
            </button>
            <h2 className="font-semibold text-base md:text-lg hidden sm:block">Dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
              <p className="text-xs text-zinc-400">{session?.user?.role}</p>
            </div>
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
              {(session?.user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="pl-3 border-l border-zinc-200">
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

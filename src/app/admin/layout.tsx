import Link from 'next/link';
import { LayoutDashboard, Users, CreditCard, Settings, Terminal } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/ui/LogoutButton';

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'SUPERADMIN') {
    redirect('/login');
  }

  return (
    <div className="flex bg-zinc-900 min-h-screen text-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-zinc-800 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Terminal className="w-6 h-6 mr-2 text-primary" />
          <h1 className="text-lg font-bold">SaaS Admin</h1>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            <li>
              <Link href="/admin" className="flex items-center px-6 py-2.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors font-medium">
                <LayoutDashboard className="w-4 h-4 mr-3" />
                Overview
              </Link>
            </li>
            <li>
              <Link href="/admin/tenants" className="flex items-center px-6 py-2.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors font-medium">
                <Users className="w-4 h-4 mr-3" />
                Tenants
              </Link>
            </li>
            <li>
              <Link href="/admin/billing" className="flex items-center px-6 py-2.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors font-medium">
                <CreditCard className="w-4 h-4 mr-3" />
                Billing
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="flex items-center px-6 py-2.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors font-medium">
                <Settings className="w-4 h-4 mr-3" />
                Platform Settings
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-black border-b border-zinc-800 flex items-center px-6 justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg hidden md:block">Super Admin Portal</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{session.user?.name}</p>
              <p className="text-xs text-zinc-500">System Administrator</p>
            </div>
            <div className="pl-4 border-l border-zinc-800">
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-zinc-950">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

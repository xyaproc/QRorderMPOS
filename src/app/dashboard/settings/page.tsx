import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Save } from 'lucide-react';
import { updateAccountSettings } from '@/app/actions/dashboard';
import SubmitButton from '@/components/ui/SubmitButton';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  const user = session?.user?.email ? await prisma.user.findUnique({
    where: { email: session.user.email }
  }) : null;

  return (
    <form action={updateAccountSettings} className="space-y-8 pb-10">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Account Settings</h1>
          <p className="text-zinc-500 mt-1">Manage your administrator account and preferences.</p>
        </div>
        <SubmitButton>
          <Save className="w-5 h-5" />
          Save Changes
        </SubmitButton>
      </div>

      <div className="max-w-2xl bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
          <input name="name" type="text" defaultValue={user?.name || session?.user?.name || ''} className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Email Address (Read-only)</label>
          <input type="email" defaultValue={session?.user?.email || ''} readOnly className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-zinc-50 text-zinc-500 outline-none" />
        </div>
        <div className="pt-4 border-t border-zinc-100">
          <label className="block text-sm font-medium text-zinc-700 mb-1">Change Password (leave blank to keep current)</label>
          <input name="password" type="password" placeholder="New password" className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all mb-3" />
          <input name="confirmPassword" type="password" placeholder="Confirm new password" className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all" />
        </div>
      </div>
    </form>
  );
}

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MobileDashboardLayout from '@/components/dashboard/MobileDashboardLayout';

export default async function TenantDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'RESTAURANT') {
    redirect('/login?callbackUrl=/dashboard');
  }

  return <MobileDashboardLayout session={session}>{children}</MobileDashboardLayout>;
}

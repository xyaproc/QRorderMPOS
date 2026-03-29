import prisma from '@/lib/prisma';
import LandingSettingsForm from '@/components/dashboard/LandingSettingsForm';

export default async function LandingPageSettings() {
  // Using user session to get subdomain in real app, but using hardcoded demo
  const subdomain = 'sate-taichan'; 
  const restaurant = await prisma.restaurant.findUnique({
    where: { subdomain },
    include: { theme: true }
  });

  if (!restaurant) return <div>Restaurant not found</div>;

  return <LandingSettingsForm restaurant={restaurant} />;
}

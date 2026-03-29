import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.restaurant.updateMany({
    where: { subdomain: 'namacafe' },
    data: {
      name: 'Sate Taichan Sarjana',
      logoUrl: '/logo.png'
    }
  });
  
  console.log(`Updated ${result.count} restaurant(s) to Sate Taichan Sarjana`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

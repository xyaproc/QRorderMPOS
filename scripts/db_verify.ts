import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    const restaurants = await prisma.restaurant.findMany();
    console.log('--- DEBUG INFO ---');
    console.log('USERS COUNT:', users.length);
    users.forEach(u => console.log(` - ${u.email} (${u.role})`));
    console.log('RESTAURANTS COUNT:', restaurants.length);
    restaurants.forEach(r => console.log(` - ${r.subdomain} (${r.name})`));
  } catch (err) {
    console.error('DATABASE ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

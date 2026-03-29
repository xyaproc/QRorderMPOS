import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import fs from 'fs';

async function main() {
  const rests = await prisma.restaurant.findMany({
    include: { _count: { select: { menus: true } } }
  });
  
  const content = rests.map(r => `NAME: ${r.name} | SUBDOMAIN: ${r.subdomain} | MENUS: ${r._count.menus}`).join('\n');
  fs.writeFileSync('db-rests.txt', content);
}

main().catch(console.error).finally(()=>prisma.$disconnect());

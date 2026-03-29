import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import fs from 'fs';

async function main() {
  const menus = await prisma.menu.findMany({
    include: { restaurant: true, category: true }
  });
  
  const content = menus.map(m => `[${m.restaurant.name}] [${m.category.name}] ${m.name} (Available: ${m.isAvailable})`).join('\n');
  fs.writeFileSync('db-menus.txt', `TOTAL: ${menus.length}\n${content}`);
}

main().catch(console.error).finally(()=>prisma.$disconnect());

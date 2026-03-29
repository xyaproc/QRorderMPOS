import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@saas.com' },
    update: { 
      // @ts-ignore
      passwordHash 
    },
    create: {
      email: 'admin@saas.com',
      name: 'Super Admin',
      role: 'SUPERADMIN',
      // @ts-ignore
      passwordHash,
    },
  });

  const restaurantAdmin = await prisma.user.upsert({
    where: { email: 'admin@sate-taichan.app' },
    update: { 
      // @ts-ignore
      passwordHash 
    },
    create: {
      email: 'admin@sate-taichan.app',
      name: 'Nama Cafe Owner',
      role: 'RESTAURANT',
      // @ts-ignore
      passwordHash,
    },
  });

  const restaurant = await prisma.restaurant.upsert({
    where: { subdomain: 'sate-taichan' },
    update: {},
    create: {
      name: 'Nama Cafe',
      subdomain: 'sate-taichan',
      ownerId: restaurantAdmin.id,
      description: 'A cozy place for coffee and code.',
      address: '123 Tech Street, Silicon Valley',
      phone: '+1 234 567 8900',
      theme: {
        create: {
          templateName: 'modern-minimalist',
          primaryColor: '#000000',
        }
      },
      subscription: {
        create: {
          plan: 'MONTHLY',
          status: 'ACTIVE',
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        }
      }
    }
  });

  // Create a category
  const category = await prisma.category.create({
    data: {
      name: 'Coffee',
      restaurantId: restaurant.id,
    }
  });

  // Create a menu item
  const menu = await prisma.menu.create({
    data: {
      name: 'Espresso',
      price: 3.5,
      description: 'Strong and bold.',
      categoryId: category.id,
      restaurantId: restaurant.id,
    }
  });

  // Create a table
  const table = await prisma.table.create({
    data: {
      number: '1',
      restaurantId: restaurant.id,
    }
  });

  console.log('Seed db successfully:', { superAdmin: superAdmin.id, restaurant: restaurant.subdomain });
}

main().catch(console.error).finally(() => prisma.$disconnect());

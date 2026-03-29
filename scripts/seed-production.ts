import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database produksi...');

  // Hash passwords
  const superAdminPassword = await bcrypt.hash('SuperAdmin@123', 10);
  const restaurantAdminPassword = await bcrypt.hash('Cafe@123456', 10);

  // 1. Buat SuperAdmin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@qrcafe.app' },
    update: {},
    create: {
      email: 'superadmin@qrcafe.app',
      name: 'Super Administrator',
      passwordHash: superAdminPassword,
      role: 'SUPERADMIN',
    },
  });
  console.log('✅ SuperAdmin dibuat:', superAdmin.email);

  // 2. Buat Restaurant Admin
  const restaurantAdmin = await prisma.user.upsert({
    where: { email: 'admin@cafedemo.app' },
    update: {},
    create: {
      email: 'admin@cafedemo.app',
      name: 'Admin Cafe Demo',
      passwordHash: restaurantAdminPassword,
      role: 'RESTAURANT_ADMIN',
    },
  });
  console.log('✅ Restaurant Admin dibuat:', restaurantAdmin.email);

  // 3. Buat Restaurant Demo
  const restaurant = await prisma.restaurant.upsert({
    where: { subdomain: 'cafedemo' },
    update: {},
    create: {
      name: 'Cafe Demo Modern',
      subdomain: 'cafedemo',
      description: 'Cafe Modern dengan sistem order QR terbaik',
      address: 'Jl. Demo No. 1, Jakarta',
      phone: '08123456789',
      ownerId: restaurantAdmin.id,
    },
  });
  console.log('✅ Restaurant dibuat:', restaurant.name);

  // 4. Update restaurantAdmin supaya terhubung dengan restaurant
  await prisma.user.update({
    where: { id: restaurantAdmin.id },
    data: { staffRestaurantId: null },
  });

  // 5. Buat Kategori demo
  const kategoriMakanan = await prisma.category.upsert({
    where: { id: 'cat-makanan-demo' },
    update: {},
    create: {
      id: 'cat-makanan-demo',
      name: 'Makanan',
      restaurantId: restaurant.id,
    },
  });

  const kategoriMinuman = await prisma.category.upsert({
    where: { id: 'cat-minuman-demo' },
    update: {},
    create: {
      id: 'cat-minuman-demo',
      name: 'Minuman',
      restaurantId: restaurant.id,
    },
  });
  console.log('✅ Kategori dibuat: Makanan & Minuman');

  // 6. Buat Menu demo
  await prisma.menu.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'menu-nasi-goreng',
        name: 'Nasi Goreng Special',
        description: 'Nasi goreng dengan telur, ayam, dan sayuran segar',
        price: 25000,
        categoryId: kategoriMakanan.id,
        restaurantId: restaurant.id,
        isAvailable: true,
      },
      {
        id: 'menu-ayam-bakar',
        name: 'Ayam Bakar Madu',
        description: 'Ayam bakar dengan bumbu madu istimewa',
        price: 35000,
        categoryId: kategoriMakanan.id,
        restaurantId: restaurant.id,
        isAvailable: true,
      },
      {
        id: 'menu-es-teh',
        name: 'Es Teh Manis',
        description: 'Teh manis segar dengan es',
        price: 8000,
        categoryId: kategoriMinuman.id,
        restaurantId: restaurant.id,
        isAvailable: true,
      },
      {
        id: 'menu-kopi-susu',
        name: 'Kopi Susu Kekinian',
        description: 'Kopi susu dengan gula aren pilihan',
        price: 18000,
        categoryId: kategoriMinuman.id,
        restaurantId: restaurant.id,
        isAvailable: true,
      },
    ],
  });
  console.log('✅ Menu demo dibuat: Nasi Goreng, Ayam Bakar, Es Teh, Kopi Susu');

  // 7. Buat Meja demo
  await prisma.table.createMany({
    skipDuplicates: true,
    data: [
      { id: 'meja-1', number: '1', restaurantId: restaurant.id, isActive: true },
      { id: 'meja-2', number: '2', restaurantId: restaurant.id, isActive: true },
      { id: 'meja-3', number: '3', restaurantId: restaurant.id, isActive: true },
      { id: 'meja-4', number: '4', restaurantId: restaurant.id, isActive: true },
      { id: 'meja-5', number: '5', restaurantId: restaurant.id, isActive: true },
    ],
  });
  console.log('✅ 5 Meja demo dibuat');

  console.log('\n🎉 SELESAI! Akun siap digunakan:\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👑 SUPER ADMIN:');
  console.log('   Email    : superadmin@qrcafe.app');
  console.log('   Password : SuperAdmin@123');
  console.log('   Akses    : https://qr-order-mpos.vercel.app/login');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🍽️  ADMIN CAFE DEMO:');
  console.log('   Email    : admin@cafedemo.app');
  console.log('   Password : Cafe@123456');
  console.log('   Akses    : https://qr-order-mpos.vercel.app/login');
  console.log('   Subdomain: cafedemo');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

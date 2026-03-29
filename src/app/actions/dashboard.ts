'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addTable(restaurantId: string) {
  const count = await prisma.table.count({ where: { restaurantId } });
  await prisma.table.create({
    data: {
      number: (count + 1).toString(),
      restaurantId,
    }
  });
  revalidatePath('/dashboard/tables');
  revalidatePath('/dashboard');
}

export async function deleteTable(id: string) {
  await prisma.table.delete({ where: { id } });
  revalidatePath('/dashboard/tables');
  revalidatePath('/dashboard');
}

export async function addCategory(restaurantId: string) {
  await prisma.category.create({
    data: {
      name: 'New Category',
      restaurantId,
    }
  });
  revalidatePath('/dashboard/menu');
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath('/dashboard/menu');
}

export async function renameCategory(id: string, name: string) {
  await prisma.category.update({ where: { id }, data: { name } });
  revalidatePath('/dashboard/menu');
}

export async function addMenuItem(categoryId: string, restaurantId: string) {
  await prisma.menu.create({
    data: {
      name: 'New Item',
      price: 0,
      description: 'Tap to edit description',
      categoryId,
      restaurantId
    }
  });
  revalidatePath('/dashboard/menu');
}

export async function deleteMenuItem(id: string) {
  await prisma.menu.delete({ where: { id } });
  revalidatePath('/dashboard/menu');
}

export async function editMenuItem(id: string, data: { name: string, price: number, discountPrice: number | null, description: string, imageUrl: string }) {
  await prisma.menu.update({
    where: { id },
    data
  });
  revalidatePath('/dashboard/menu');
}

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function updateAccountSettings(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return;

  const name = formData.get('name') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const updateData: any = { name };
  if (password && password === confirmPassword) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: updateData
  });
  
  revalidatePath('/dashboard/settings');
}

export async function updateLandingSettings(restaurantId: string, data: { name: string, description: string, address: string, phone: string, logoUrl: string, bannerUrl: string, templateName: string, primaryColor: string }) {
  const { templateName, primaryColor, ...restaurantData } = data;
  
  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      ...restaurantData,
      theme: {
        upsert: {
          create: { templateName, primaryColor },
          update: { templateName, primaryColor }
        }
      }
    }
  });
  
  revalidatePath('/dashboard/landing');
  revalidatePath('/' + restaurantData.name); // revalidate the landing page
}

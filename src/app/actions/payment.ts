'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function payCustomerOrder(orderId: string, method: string) {
  // Update order to PAID
  await prisma.order.update({
    where: { id: orderId },
    data: { 
      paymentStatus: 'PAID',
      paymentMethod: method
    }
  });

  // Revalidate paths so Kitchen Board and Order Tracker update
  revalidatePath('/dashboard/kitchen');
  revalidatePath('/', 'layout');
  
  return { success: true };
}

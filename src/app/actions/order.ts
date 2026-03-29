'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createOrder(
  restaurantId: string, 
  tableNumber: string, 
  customerName: string, 
  customerPhone: string, 
  cartItems: { id: string, quantity: number, price: number }[]
) {
  const table = await prisma.table.findUnique({
    where: { restaurantId_number: { restaurantId, number: tableNumber } }
  });
  
  if (!table) throw new Error("Table not found");

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalAmount = subtotal * 1.1; // Add 10% tax

  const order = await prisma.order.create({
    data: {
      restaurantId,
      tableId: table.id,
      customerName,
      // @ts-ignore
      customerPhone,
      sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      status: "WAITING",
      paymentStatus: "PENDING",
      totalAmount,
      orderItems: {
        create: cartItems.map(item => ({
          menuId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      }
    }
  });

  revalidatePath('/dashboard');
  return { success: true, orderId: order.id };
}

export async function updateOrderStatus(orderId: string, status: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });
  revalidatePath('/dashboard/kitchen');
  // Revalidate the entire routing segment for order tracking
  revalidatePath('/', 'layout');
}

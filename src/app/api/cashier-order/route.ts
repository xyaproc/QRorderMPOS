import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { restaurantId, tableNumber, customerName, paymentMethod, items } = body;

  try {
    // Find or create table based on number
    let table = await prisma.table.findUnique({
      where: { restaurantId_number: { restaurantId, number: tableNumber } }
    });

    // For takeaway, use the first table or create a default
    if (!table) {
      const existing = await prisma.table.findFirst({ where: { restaurantId } });
      if (!existing) throw new Error('No table found');
      table = existing;
    }

    const subtotal = items.reduce((acc: number, item: { price: number; quantity: number }) => acc + item.price * item.quantity, 0);
    const totalAmount = subtotal * 1.1; // 10% tax

    const order = await prisma.order.create({
      data: {
        restaurantId,
        tableId: table.id,
        customerName: customerName || 'Kasir',
        // @ts-ignore
        customerPhone: '',
        sessionId: `cashier_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        status: 'SERVED', // Cashier orders are already served
        paymentStatus: 'PAID',
        totalAmount,
        orderItems: {
          create: items.map((item: { id: string; quantity: number; price: number }) => ({
            menuId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/reports');
    
    return NextResponse.json({ orderId: order.id, success: true });
  } catch (error) {
    console.error('Cashier order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

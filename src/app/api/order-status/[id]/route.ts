import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      table: true,
      orderItems: { include: { menu: true } },
    }
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id,
    status: order.status,
    customerName: order.customerName,
    tableNumber: order.table?.number,
    createdAt: order.createdAt,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    items: order.orderItems.map((i: any) => ({
      name: i.menu?.name,
      quantity: i.quantity,
      price: i.price,
      imageUrl: i.menu?.imageUrl,
    }))
  });
}

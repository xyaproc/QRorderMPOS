import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Scaffolding for a payment webhook handler
    // Verification of signature would go here (e.g. Midtrans signature key)
    
    console.log("Received payment webhook:", body);
    
    const orderId = body.order_id;
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;

    let paymentStatus = 'PENDING';

    if (transactionStatus == 'capture'){
      if (fraudStatus == 'challenge'){
        paymentStatus = 'CHALLENGE';
      } else if (fraudStatus == 'accept'){
        paymentStatus = 'PAID';
      }
    } else if (transactionStatus == 'settlement'){
      paymentStatus = 'PAID';
    } else if (transactionStatus == 'cancel' ||
      transactionStatus == 'deny' ||
      transactionStatus == 'expire'){
      paymentStatus = 'FAILED';
    } else if (transactionStatus == 'pending'){
      paymentStatus = 'PENDING';
    }
    
    // Next steps:
    // await prisma.order.update({
    //   where: { id: orderId },
    //   data: { paymentStatus }
    // });
    // await prisma.payment.update({...})

    return NextResponse.json({ status: 'success', paymentStatus });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: 'Invalid payload' }, { status: 400 });
  }
}

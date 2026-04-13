import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { items, address, totalAmount } = await req.json();

    // 1. Validate Stock before creating Order ID
    for (const item of items) {
      const productSize = await prisma.productSize.findFirst({
        where: {
          productId: item.productId,
          size: item.size
        }
      });

      if (!productSize || productSize.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for ${item.name} in size ${item.size}` 
        }, { status: 400 });
      }
    }

    // 2. Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // 3. Create Order in DB
    const order = await prisma.order.create({
      data: {
        userId: (session.user as any).id,
        totalAmount,
        paymentMethod: "UPI", // Placeholder, updated after payment
        razorpayOrderId: razorpayOrder.id,
        shippingAddress: `${address.street}, ${address.city}, ${address.state} - ${address.pinCode}`,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      dbOrderId: order.id
    });

  } catch (error: any) {
    console.error("Order creation failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const { items, address, totalAmount, paymentMethod } = await req.json();

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

    let razorpayOrder = null;
    if (paymentMethod === "ONLINE") {
      // Initialize Razorpay only when needed
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });
      // 2. Create Razorpay Order
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100), // in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });
    }

    // 3. Create Order and Deduct Stock in a Transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: session?.user ? (session.user as any).id : null,
          totalAmount,
          paymentMethod: paymentMethod === "COD" ? "COD" : "UPI", 
          paymentStatus: "PENDING",
          razorpayOrderId: razorpayOrder?.id,
          shippingAddress: `${address.name} | ${address.phone} | ${address.street}, ${address.city}, ${address.state} - ${address.pinCode}`,
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

      // 4. Deduct Stock immediately for COD
      if (paymentMethod === "COD") {
        for (const item of items) {
          await tx.productSize.update({
            where: {
              productId_size: {
                productId: item.productId,
                size: item.size
              }
            },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        }
      }

      return newOrder;
    });

    return NextResponse.json({
      orderId: razorpayOrder?.id,
      amount: razorpayOrder?.amount,
      dbOrderId: order.id
    });

  } catch (error: any) {
    console.error("Order creation failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

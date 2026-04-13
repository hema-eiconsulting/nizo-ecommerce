import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      dbOrderId 
    } = await req.json();

    // 1. Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 2. Transact (Update Order Status and Deduct Stock)
    await prisma.$transaction(async (tx) => {
      // Find the order and its items
      const order = await tx.order.findUnique({
        where: { id: dbOrderId },
        include: { items: true }
      });

      if (!order) throw new Error("Order not found");

      // Update Order
      await tx.order.update({
        where: { id: dbOrderId },
        data: {
          paymentStatus: "COMPLETED",
          razorpayPaymentId: razorpay_payment_id,
          status: "CONFIRMED"
        }
      });

      // Deduct Stock for each item
      for (const item of order.items) {
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
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Payment verification failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

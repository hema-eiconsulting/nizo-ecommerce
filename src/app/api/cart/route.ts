import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ items: [] });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: (session.user as any).id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart) {
    return NextResponse.json({ items: [] });
  }

  const items = cart.items.map((item) => ({
    id: `${item.productId}-${item.size}`,
    productId: item.productId,
    name: item.product.name,
    price: item.product.price,
    image: item.product.images[0],
    size: item.size,
    quantity: item.quantity,
    maxStock: 99, // Fallback if not specifically tracked per size in this response
  }));

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { items } = await req.json(); // Array of { productId, size, quantity }
    const userId = (session.user as any).id;

    // Use a transaction to update the cart
    await prisma.$transaction(async (tx) => {
      // Find or create cart
      let cart = await tx.cart.findUnique({
        where: { userId },
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: { userId },
        });
      }

      // Delete existing items and recreate them
      // This is a simple sync strategy. For more complex ones, you'd upsert.
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      if (items && items.length > 0) {
        await tx.cartItem.createMany({
          data: items.map((item: any) => ({
            cartId: cart!.id,
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
          })),
        });
      }
    });

    return NextResponse.json({ message: "Cart synced" });
  } catch (error) {
    console.error("Cart sync error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

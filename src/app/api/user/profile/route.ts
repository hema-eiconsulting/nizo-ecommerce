import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const [orders, cart, searchHistory] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: { product: true }
          }
        }
      }),
      prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    // Format cart items
    const cartItems = cart?.items.map(item => ({
      id: `${item.productId}-${item.size}`,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images[0],
      size: item.size,
      quantity: item.quantity
    })) || [];

    return NextResponse.json({
      orders,
      cartItems,
      searchHistory
    });
  } catch (error) {
    console.error("Profile data error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function GET() {
  try {
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        },
        orders: {
          select: { totalAmount: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Calculate total spend for each customer
    const formattedCustomers = customers.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      memberSince: c.createdAt,
      orderCount: c._count.orders,
      totalSpend: c.orders.reduce((sum, o) => sum + o.totalAmount, 0)
    }));

    return NextResponse.json(formattedCustomers, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

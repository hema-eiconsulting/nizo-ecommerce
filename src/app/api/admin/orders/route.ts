import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all for simplicity in this setup, or restrict to known admin domains
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function GET() {
  try {
    // Admin check via x-api-key or session
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        },
        items: {
          include: {
            product: {
              select: { name: true, images: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(orders, { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

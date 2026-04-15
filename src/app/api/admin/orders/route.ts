import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_URL = "https://admin-fvcis6d6a-hema-eiconsultings-projects.vercel.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": ADMIN_URL,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        },
        items: true
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

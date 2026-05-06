import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Check for API key or skip if not in env
    const apiKey = req.headers.get("x-api-key");
    const validApiKey = process.env.ADMIN_API_KEY;
    
    if (validApiKey && apiKey !== validApiKey) {
      return NextResponse.json({ error: "Unauthorized API Key" }, { status: 401, headers: corsHeaders });
    }

    const { status } = await req.json();

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(order, { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const getCorsHeaders = (origin: string | null) => {
  // Allow any origin since authentication is handled robustly via API keys
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
  };
};

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, { headers: getCorsHeaders(origin) });
}

export async function GET(req: Request) {
  const origin = req.headers.get("origin");
  const headers = getCorsHeaders(origin);
  try {
    const { searchParams } = new URL(req.url);
    const gender = searchParams.get("gender");
    const category = searchParams.get("category");
    const query = searchParams.get("q");

    const products = await prisma.product.findMany({
      where: {
        ...(gender && { gender: gender.toUpperCase() as any }),
        ...(category && { category: category.toUpperCase() as any }),
        ...(query && {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ]
        })
      },
      include: {
        sizes: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products, { 
      headers: { ...headers, "Cache-Control": "no-store, max-age=0" } 
    });
  } catch (error: any) {
    console.error("[PRODUCTS_GET] Full Error:", error);
    return new NextResponse(JSON.stringify({ 
      error: error.message || "Internal error",
      details: "This usually means your DATABASE_URL is not set correctly in Vercel."
    }), { 
      status: 500, 
      headers: { ...headers, "Content-Type": "application/json" } 
    });
  }
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const headers = getCorsHeaders(origin);
  try {
    const apiKey = req.headers.get("x-api-key");
    const validApiKey = process.env.ADMIN_API_KEY || "a3f8c9e2b1d4f7c0e9a2b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3";
    
    let isAuthorized = false;

    if (apiKey === validApiKey) {
      isAuthorized = true;
    } else {
      const session = await getServerSession(authOptions);
      if (session && (session.user as any)?.role === "ADMIN") {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new NextResponse("Unauthorized", { status: 401, headers });
    }

    const body = await req.json();
    const { 
      name, 
      description, 
      price, 
      gender, 
      category, 
      images, 
      colors, 
      sizes,
      isActive 
    } = body;

    if (!name || !price || !gender || !category || !sizes || sizes.length === 0) {
      return new NextResponse("Missing required fields", { status: 400, headers });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        gender,
        category,
        images,
        colors,
        isActive: isActive !== undefined ? isActive : true,
        sizes: {
          create: sizes.map((s: { size: string, stock: number }) => ({
            size: s.size,
            stock: parseInt(s.stock.toString()),
          })),
        },
      },
      include: {
        sizes: true,
      },
    });

    return NextResponse.json(product, { headers });
  } catch (error: any) {
    console.error("[PRODUCTS_POST] Full Error:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta,
    });
    return new NextResponse(JSON.stringify({ error: error.message || "Internal error" }), { 
      status: 500, 
      headers: { ...headers, "Content-Type": "application/json" } 
    });
  }
}

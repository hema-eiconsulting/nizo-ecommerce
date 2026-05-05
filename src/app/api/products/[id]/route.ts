import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const getCorsHeaders = (origin: string | null) => {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
  };
};

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, { headers: getCorsHeaders(origin) });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const origin = req.headers.get("origin");
  const headers = getCorsHeaders(origin);
  try {
    if (!id) {
      return new NextResponse("Product ID is required", { status: 400, headers });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: id,
      },
      include: {
        sizes: true,
      },
    });

    return NextResponse.json(product, { headers });
  } catch (error) {
    console.error("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", { status: 500, headers });
  }
}

async function checkAuth(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  const validApiKey = process.env.ADMIN_API_KEY || "a3f8c9e2b1d4f7c0e9a2b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3";
  
  if (apiKey === validApiKey) return true;

  const session = await getServerSession(authOptions);
  return session && (session.user as any)?.role === "ADMIN";
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const origin = req.headers.get("origin");
  const headers = getCorsHeaders(origin);
  try {
    if (!(await checkAuth(req))) {
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

    if (!id) {
      return new NextResponse("Product ID is required", { status: 400, headers });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        gender,
        category,
        images,
        colors,
        isActive,
      },
    });

    if (sizes && sizes.length > 0) {
      for (const s of sizes) {
         await prisma.productSize.upsert({
           where: {
             productId_size: {
               productId: id,
               size: s.size,
             }
           },
           update: {
             stock: parseInt(s.stock.toString()),
           },
           create: {
             productId: id,
             size: s.size,
             stock: parseInt(s.stock.toString()),
           }
         });
      }
    }

    return NextResponse.json(product, { headers });
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500, headers });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const origin = req.headers.get("origin");
  const headers = getCorsHeaders(origin);
  try {
    if (!(await checkAuth(req))) {
      return new NextResponse("Unauthorized", { status: 401, headers });
    }

    if (!id) {
      return new NextResponse("Product ID is required", { status: 400, headers });
    }

    const product = await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json(product, { headers });
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500, headers });
  }
}

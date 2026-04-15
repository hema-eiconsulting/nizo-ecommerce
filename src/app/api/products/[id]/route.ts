import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    if (!id) {
      return new NextResponse("Product ID is required", { status: 400, headers: corsHeaders });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: id,
      },
      include: {
        sizes: true,
      },
    });

    return NextResponse.json(product, { headers: corsHeaders });
  } catch (error) {
    console.error("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", { status: 500, headers: corsHeaders });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
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
      return new NextResponse("Product ID is required", { status: 400 });
    }

    // Update product and handle sizes separately to ensure sync
    const product = await prisma.product.update({
      where: {
        id: id,
      },
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
      // Simple reconciliation: update existing or create new
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

    return NextResponse.json(product, { headers: corsHeaders });
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401, headers: corsHeaders });
    }

    if (!id) {
      return new NextResponse("Product ID is required", { status: 400, headers: corsHeaders });
    }

    const product = await prisma.product.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(product, { headers: corsHeaders });
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500, headers: corsHeaders });
  }
}

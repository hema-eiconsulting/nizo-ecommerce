import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
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

    return NextResponse.json(products);
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
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
      sizes 
    } = body;

    if (!name || !price || !gender || !category || !sizes || sizes.length === 0) {
      return new NextResponse("Missing required fields", { status: 400 });
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

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

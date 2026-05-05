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
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Address fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const { name, phone, street, city, state, pinCode, isDefault } = body;

    const address = await prisma.address.create({
      data: {
        userId,
        name,
        phone,
        street,
        city,
        state,
        pinCode,
        isDefault: isDefault || false
      }
    });

    return NextResponse.json({ address });
  } catch (error) {
    console.error("Address save error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

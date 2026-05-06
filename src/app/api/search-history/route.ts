import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Not logged in" }, { status: 200 }); // Silent fail for guests
  }

  try {
    const { query } = await req.json();
    if (!query || query.trim() === "") {
      return NextResponse.json({ message: "Query required" }, { status: 400 });
    }

    await prisma.searchHistory.create({
      data: {
        userId: (session.user as any).id,
        query: query.trim(),
      },
    });

    return NextResponse.json({ message: "Search logged" });
  } catch (error) {
    console.error("Search logging error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ history: [] });
  }

  const history = await prisma.searchHistory.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ history });
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check connection and get some metadata
    const dbInfo = await prisma.$queryRaw`SELECT current_database(), current_schema(), current_user`;
    const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User'
    `;
    
    return NextResponse.json({
      status: 'connected',
      dbInfo,
      columns,
      envUsed: process.env.DATABASE_URL ? 'DATABASE_URL is set' : 'DATABASE_URL is MISSING'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

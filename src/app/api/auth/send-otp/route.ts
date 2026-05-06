import { NextResponse } from "next/server";

// OTP-based authentication is not currently enabled.
export async function POST() {
  return NextResponse.json({ error: "OTP authentication is not enabled." }, { status: 501 });
}

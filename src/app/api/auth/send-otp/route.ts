import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { generateOtp, sendOtpSms } from "@/lib/sms";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { error: "A valid phone number is required" },
        { status: 400 }
      );
    }

    // Generate a 6-digit OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Upsert OTP record (one per phone number)
    await prisma.otpVerification.upsert({
      where: { phone },
      update: { otp: hashedOtp, expiresAt },
      create: { phone, otp: hashedOtp, expiresAt },
    });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
      select: { id: true, name: true },
    });

    // Send OTP via Twilio
    await sendOtpSms(phone, otp);

    return NextResponse.json({
      success: true,
      isNewUser: !existingUser,
      message: "OTP sent successfully",
    });
  } catch (error: any) {
    console.error("send-otp error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}

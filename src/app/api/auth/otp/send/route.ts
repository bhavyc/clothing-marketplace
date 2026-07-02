import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^\+91\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: "A valid phone number starting with +91 is required." },
        { status: 400 }
      );
    }

    // 1. Generate 6-digit OTP and expiration (5 minutes from now)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // 2. Find user by phone number
    let user = await prisma.user.findFirst({
      where: { phone },
    });

    if (!user) {
      // Create user if not exists with placeholder credentials
      const placeholderEmail = `user-${phone.replace("+", "")}@boutique.com`;
      const hashedPassword = await bcrypt.hash(`otp-temp-pwd-${Date.now()}`, 10);
      user = await prisma.user.create({
        data: {
          email: placeholderEmail,
          password: hashedPassword,
          phone,
          resetOtp: otp,
          resetOtpExpires: otpExpires,
        },
      });
    } else {
      // Update existing user with new OTP
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetOtp: otp,
          resetOtpExpires: otpExpires,
        },
      });
    }

    // 3. Print OTP to next.js backend logs (Simulated SMS Gateway)
    console.log(`\n==================================================`);
    console.log(`💬  [SMS SIMULATION] VERIFICATION OTP`);
    console.log(`To Mobile: ${phone}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires: ${otpExpires.toLocaleTimeString()}`);
    console.log(`==================================================\n`);

    const responsePayload: any = {
      success: true,
      message: "Verification OTP code sent successfully.",
    };

    // For convenience in dev, return the OTP
    if (process.env.NODE_ENV !== "production") {
      responsePayload.devOtp = otp;
    }

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to generate verification OTP." },
      { status: 500 }
    );
  }
}

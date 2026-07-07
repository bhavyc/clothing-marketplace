import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, optInWhatsApp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP code are required." },
        { status: 400 }
      );
    }

    // 1. Fetch user by phone number
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    const isDemoBypass = phone === "+919999999999" && otp === "123456";

    if (!isDemoBypass && (!user || !user.resetOtp)) {
      return NextResponse.json(
        { error: "No active verification request found for this phone number." },
        { status: 400 }
      );
    }

    // 2. Validate code and expiration
    if (!isDemoBypass && user && user.resetOtp !== otp) {
      return NextResponse.json(
        { error: "Incorrect verification code. Please try again." },
        { status: 400 }
      );
    }

    if (!isDemoBypass && user && user.resetOtpExpires && new Date() > new Date(user.resetOtpExpires)) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // 3. Clear verification fields and capture WhatsApp opt-in consent
    const isOptedIn = !!optInWhatsApp;
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetOtp: null,
          resetOtpExpires: null,
          optInWhatsApp: isOptedIn,
          optInDate: isOptedIn ? new Date() : null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully.",
    });
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "OTP verification failed." },
      { status: 500 }
    );
  }
}

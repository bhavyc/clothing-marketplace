import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid email address is required." },
        { status: 400 }
      );
    }

    const formattedEmail = email.trim().toLowerCase();

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: formattedEmail },
    });

    if (!user) {
      // Security best practice: don't reveal if a user doesn't exist,
      // but in our boutique context, a simple helpful validation or standard response is preferred.
      return NextResponse.json(
        { error: "No account found with this email address." },
        { status: 404 }
      );
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    // 3. Save to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: otp,
        resetOtpExpires: otpExpires,
      },
    });

    // 4. Print OTP in Next.js server console logs (simulating email delivery)
    console.log(`\n==================================================`);
    console.log(`✉️  [EMAIL SIMULATION] PASSWORD RESET OTP`);
    console.log(`To: ${formattedEmail}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires: ${otpExpires.toLocaleTimeString()}`);
    console.log(`==================================================\n`);

    // 5. Response
    const responsePayload: any = {
      success: true,
      message: "One-Time Password (OTP) has been sent to your email address.",
    };

    // For dev mode convenience, expose the OTP in response
    if (process.env.NODE_ENV !== "production") {
      responsePayload.devOtp = otp;
    }

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("Forgot password OTP generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request." },
      { status: 500 }
    );
  }
}

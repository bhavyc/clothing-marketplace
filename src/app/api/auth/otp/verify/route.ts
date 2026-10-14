import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signAuthToken } from "@/lib/auth";
import { DEMO_OTP, isDummyPhoneNumber, normalizePhoneNumber, getOrCreateDemoUser } from "@/lib/demo-auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, optInWhatsApp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP code are required." },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    const trimmedOtp = String(otp).trim();

    // App Store Reviewer / Demo Login Bypass
    if (isDummyPhoneNumber(normalizedPhone) && (trimmedOtp === DEMO_OTP || trimmedOtp === "1234")) {
      const demoUser = await getOrCreateDemoUser(normalizedPhone);
      const payload = {
        id: demoUser.id,
        phone: demoUser.phone,
        role: demoUser.role,
        email: demoUser.email,
        name: demoUser.name,
        sellerProfileId: demoUser.sellerProfile?.id || null,
        expires: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
      };
      const token = signAuthToken(payload);

      return NextResponse.json({
        success: true,
        message: "Phone number verified successfully (Demo Reviewer Account).",
        token,
        user: {
          id: demoUser.id,
          phone: demoUser.phone || "",
          email: demoUser.email || "",
          name: demoUser.name || "",
          role: demoUser.role || "CUSTOMER",
        }
      });
    }

    // 1. Fetch user by phone number
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          { phone: normalizedPhone.replace("+91", "") }
        ]
      },
      include: { sellerProfile: true },
    });

    if (!user || !user.resetOtp) {
      return NextResponse.json(
        { error: "No active verification request found for this phone number." },
        { status: 400 }
      );
    }

    // 2. Validate code and expiration
    if (user.resetOtp !== trimmedOtp) {
      return NextResponse.json(
        { error: "Incorrect verification code. Please try again." },
        { status: 400 }
      );
    }

    if (user.resetOtpExpires && new Date() > new Date(user.resetOtpExpires)) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // 3. Clear verification fields and capture WhatsApp opt-in consent
    const isOptedIn = !!optInWhatsApp;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: null,
        resetOtpExpires: null,
        optInWhatsApp: isOptedIn,
        optInDate: isOptedIn ? new Date() : null,
      },
    });

    // 4. Generate cryptographically signed token containing user details and expiration
    const payload = {
      id: user.id,
      phone: user.phone,
      role: user.role,
      email: user.email,
      name: user.name,
      sellerProfileId: user.sellerProfile?.id || null,
      expires: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    };
    const token = signAuthToken(payload);

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully.",
      token,
      user: {
        id: user?.id || "",
        phone: user?.phone || "",
        email: user?.email || "",
        name: user?.name || "",
        role: user?.role || "CUSTOMER",
      }
    });
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "OTP verification failed." },
      { status: 500 }
    );
  }
}

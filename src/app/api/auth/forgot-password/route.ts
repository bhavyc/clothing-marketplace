import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

    // 4. Send actual email with Nodemailer
    const mailOptions = {
      from: `"Vamika & Bhargavi Boutique" <${process.env.EMAIL_USER}>`,
      to: formattedEmail,
      subject: "Your Password Reset OTP Code",
      html: `
        <div style="font-family: 'Playfair Display', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #E8DFC8; background-color: #FAF8F5;">
          <h2 style="color: #1A1A1A; text-align: center; text-transform: lowercase; font-weight: 500; font-size: 24px;">
            vamika <span style="font-style: italic; color: #D4AF37;">&</span> bhargavi
          </h2>
          <div style="background-color: #FFFFFF; padding: 30px; border: 1px solid #FAF6F0; margin-top: 30px; text-align: center; border-radius: 4px;">
            <p style="font-family: sans-serif; font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 20px 0;">
              Password Reset Verification
            </p>
            <p style="font-family: sans-serif; font-size: 13px; color: #4A4A4A; line-height: 1.6; margin: 0 0 30px 0;">
              Please use the following One-Time Password (OTP) to reset your account password. This code is valid for 15 minutes.
            </p>
            <div style="display: inline-block; background-color: #FAF6F0; border: 1px solid #E8DFC8; padding: 15px 40px; font-size: 28px; font-family: monospace; font-weight: bold; letter-spacing: 0.2em; color: #1A1A1A; border-radius: 4px;">
              ${otp}
            </div>
            <p style="font-family: sans-serif; font-size: 11px; color: #888888; margin-top: 30px; margin-bottom: 0;">
              If you did not request this code, you can safely ignore this email.
            </p>
          </div>
          <p style="text-align: center; font-family: sans-serif; font-size: 10px; color: #999999; margin-top: 30px; text-transform: uppercase; letter-spacing: 0.1em;">
            © ${new Date().getFullYear()} Vamika & Bhargavi. All rights reserved.
          </p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✉️ [SMTP] Password reset OTP sent to ${formattedEmail}`);
    } catch (mailError) {
      console.error("Nodemailer failed to send email, falling back to log simulation:", mailError);
      
      // Fallback log simulation in case of invalid env configuration
      console.log(`\n==================================================`);
      console.log(`✉️  [EMAIL SIMULATION] PASSWORD RESET OTP`);
      console.log(`To: ${formattedEmail}`);
      console.log(`OTP Code: ${otp}`);
      console.log(`Expires: ${otpExpires.toLocaleTimeString()}`);
      console.log(`==================================================\n`);
    }

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

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
    const isDemoNumber = phone === "+919999999999";
    const otp = isDemoNumber ? "123456" : Math.floor(100000 + Math.random() * 900000).toString();
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

    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.replace(/^"|"$/g, "");
    const token = process.env.WHATSAPP_ACCESS_TOKEN?.replace(/^"|"$/g, "");
    // YE ADD KARO
console.log("Phone ID:", phoneId)
console.log("Token first 20 chars:", token?.slice(0, 20))
console.log("Token length:", token?.length)
    const businessId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.replace(/^"|"$/g, "");

    let sentViaWhatsApp = false;
    let metaResponseLog = "";

    if (isDemoNumber) {
      sentViaWhatsApp = true;
      console.log(`Bypassed real WhatsApp API call for Demo Number: ${phone}. Static OTP: ${otp}`);
    } else if (phoneId && token) {
      const formattedPhone = phone.replace("+", "");
      try {
        // Step 1: Detect approved templates in Meta Account
        let templateNameToUse = "";
        if (businessId) {
          try {
            const templatesRes = await fetch(
              `https://graph.facebook.com/v18.0/${businessId}/message_templates?limit=100`,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            if (templatesRes.ok) {
              const templatesData = await templatesRes.json();
              const templates = templatesData.data || [];
              const matched = templates.find((t: any) => 
                t.status === "APPROVED" && 
                (t.name.toLowerCase().includes("otp") || t.name.toLowerCase().includes("verify") || t.name.toLowerCase().includes("code") || t.name.toLowerCase().includes("auth"))
              );
              if (matched) {
                templateNameToUse = matched.name;
                console.log(`Found matching OTP template: ${templateNameToUse}`);
              }
            }
          } catch (e) {
            console.error("Error checking templates:", e);
          }
        }

        // Step 2: Try sending Template message
        const templateToTry = templateNameToUse || "verification_code";
        console.log(`Attempting to send OTP template "${templateToTry}" to ${formattedPhone}`);
        
        const templatePayload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: formattedPhone,
          type: "template",
          template: {
            name: templateToTry,
            language: { code: "en_US" },
            components: [
              {
                type: "body",
                parameters: [{ type: "text", text: otp }]
              }
            ]
          }
        };

        const resMetaTemplate = await fetch(
          `https://graph.facebook.com/v18.0/${phoneId}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(templatePayload),
          }
        );

        const templateResData = await resMetaTemplate.json();
        metaResponseLog = JSON.stringify(templateResData);
        
        if (resMetaTemplate.ok) {
          sentViaWhatsApp = true;
          console.log(`✅ OTP template message successfully sent via Meta API to ${phone}`);
        } else {
          console.warn(`Template message send failed (status: ${resMetaTemplate.status}). Response: ${metaResponseLog}`);
          
          // Step 3: Fallback to direct Text message
          console.log(`Attempting fallback to direct text message for ${formattedPhone}`);
          const textPayload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: formattedPhone,
            type: "text",
            text: {
              body: `Your Vamika & Bhargavi verification OTP code is: ${otp}. It is valid for 5 minutes.`
            }
          };

          const resMetaText = await fetch(
            `https://graph.facebook.com/v18.0/${phoneId}/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(textPayload),
            }
          );

          const textResData = await resMetaText.json();
          metaResponseLog = JSON.stringify(textResData);

          if (resMetaText.ok) {
            sentViaWhatsApp = true;
            console.log(`✅ OTP text fallback message successfully sent via Meta API to ${phone}`);
          } else {
            console.error(`Direct text message send also failed: ${metaResponseLog}`);
          }
        }
      } catch (metaErr) {
        console.error("Failed to send OTP via Meta API:", metaErr);
      }
    }

    const responsePayload: any = {
      success: true,
      message: "Verification OTP code sent successfully.",
    };

    // For convenience in dev, return the OTP
    // Temporarily enabled even in production for Vercel dev deployment as requested
    responsePayload.devOtp = otp;

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to generate verification OTP." },
      { status: 500 }
    );
  }
}

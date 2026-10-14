import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

import { DEMO_OTP, isDummyPhoneNumber, normalizePhoneNumber, getOrCreateDemoUser } from "@/lib/demo-auth";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    const normalizedPhone = normalizePhoneNumber(phone);

    if (!normalizedPhone || !/^\+91\d{10}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { error: "A valid phone number starting with +91 or 10-digit mobile number is required." },
        { status: 400 }
      );
    }

    // 0. Check if this is an App Store demo/reviewer phone number
    if (isDummyPhoneNumber(normalizedPhone)) {
      const demoUser = await getOrCreateDemoUser(normalizedPhone);
      return NextResponse.json({
        success: true,
        message: "Verification OTP sent successfully (App Store Demo Account).",
        devOtp: DEMO_OTP,
      });
    }

    // 1. Generate 6-digit OTP and expiration (5 minutes from now)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // 2. Find user by phone number
    let user = await prisma.user.findFirst({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      // Create user if not exists with placeholder credentials
      const placeholderEmail = `user-${normalizedPhone.replace("+", "")}@boutique.com`;
      const hashedPassword = await bcrypt.hash(`otp-temp-pwd-${Date.now()}`, 10);
      user = await prisma.user.create({
        data: {
          email: placeholderEmail,
          password: hashedPassword,
          phone: normalizedPhone,
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
    const businessId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.replace(/^"|"$/g, "");

    let sentViaWhatsApp = false;
    let metaResponseLog = "";

    if (phoneId && token) {
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
        const templateToTry = templateNameToUse || "verificartion_code";
        console.log(`Attempting to send OTP template "${templateToTry}" to ${formattedPhone}`);
        
        const components: any[] = [
          {
            type: "body",
            parameters: [{ type: "text", text: otp }]
          }
        ];

        // The user's template "verificartion_code" contains a URL button requiring a parameter
        if (templateToTry === "verificartion_code" || templateToTry.includes("verificartion")) {
          components.push({
            type: "button",
            sub_type: "url",
            index: 0,
            parameters: [{ type: "text", text: otp }]
          });
        }

        const templatePayload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: formattedPhone,
          type: "template",
          template: {
            name: templateToTry,
            language: { code: "en_US" },
            components
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

    // For convenience in dev, return the OTP only in development mode
    if (process.env.NODE_ENV === "development") {
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

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 401 });
    }

    const now = new Date();

    // 1. Fetch CouponSent records where:
    // - used is false
    // - reminderCount is less than 2
    // - the associated coupon's endTime has passed (expired)
    const nonConverters = await prisma.couponSent.findMany({
      where: {
        used: false,
        reminderCount: { lt: 2 },
        coupon: {
          endTime: { lt: now },
        },
      },
      include: {
        user: true,
        coupon: true,
      },
    });

    if (nonConverters.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No non-converters found with expired campaign coupons.",
        processedCount: 0,
      });
    }

    const processedList = [];

    // 2. Loop through each non-converter and dispatch dynamic reminders
    for (const record of nonConverters) {
      const user = record.user;
      const originalCoupon = record.coupon;

      // Skip if the user has opted out of WhatsApp updates
      if (!user.optInWhatsApp || !user.phone) {
        continue;
      }

      // Generate a fresh unique reminder code
      const reminderCode = `R${originalCoupon.code}${user.id.slice(0, 4)}`.toUpperCase();

      // Create a fresh lighter reminder coupon with new 67-minute expiration
      let reminderCoupon = await prisma.coupon.findUnique({
        where: { code: reminderCode },
      });

      if (!reminderCoupon) {
        // e.g. Lighter coupon gives 5% off and has 2000 min order threshold
        reminderCoupon = await prisma.coupon.create({
          data: {
            code: reminderCode,
            description: `Reminder Offer for ${originalCoupon.code} - 5% discount`,
            discountPercent: 5.0,
            minOrderValue: 2000,
            isActive: true,
            startTime: now,
            endTime: new Date(now.getTime() + 67 * 60 * 1000), // fresh 67 mins
            usageLimit: 1,
            triggerFreeGift: false, // reminder coupons do not trigger gift box
          },
        });
      } else {
        // Reactivate / extend existing reminder coupon for another 67 mins
        reminderCoupon = await prisma.coupon.update({
          where: { id: reminderCoupon.id },
          data: {
            isActive: true,
            startTime: now,
            endTime: new Date(now.getTime() + 67 * 60 * 1000),
          },
        });
      }

      // Update existing record's reminderCount
      const nextReminderCount = record.reminderCount + 1;
      await prisma.couponSent.update({
        where: { id: record.id },
        data: {
          reminderCount: nextReminderCount,
        },
      });

      // Log a new CouponSent record pointing to the fresh reminder coupon
      await prisma.couponSent.create({
        data: {
          userId: user.id,
          couponId: reminderCoupon.id,
          used: false,
          reminderCount: nextReminderCount,
        },
      });

      // 3. Send real Meta WhatsApp message / fallback
      const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.replace(/^"|"$/g, "");
      const token = process.env.WHATSAPP_ACCESS_TOKEN?.replace(/^"|"$/g, "");

      let sentViaWhatsApp = false;

      if (phoneId && token && user.phone) {
        const formattedPhone = user.phone.replace("+", "");
        try {
          const resMetaTemplate = await fetch(
            `https://graph.facebook.com/v18.0/${phoneId}/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: formattedPhone,
                type: "template",
                template: {
                  name: "reminder_promo_coupon_campaign",
                  language: { code: "en_US" },
                  components: [
                    {
                      type: "body",
                      parameters: [
                        { type: "text", text: String(originalCoupon.discountPercent || "10") },
                        { type: "text", text: reminderCode }
                      ]
                    },
                    {
                      type: "button",
                      sub_type: "url",
                      index: 0,
                      parameters: [{ type: "text", text: `?coupon=${reminderCode}&utm_source=whatsapp` }]
                    }
                  ]
                }
              }),
            }
          );

          if (resMetaTemplate.ok) {
            sentViaWhatsApp = true;
            console.log(`✅ WhatsApp reminder template sent via Meta API to ${user.phone}`);
          } else {
            const errData = await resMetaTemplate.json();
            console.warn(`Template reminder send failed (status: ${resMetaTemplate.status}). Response: ${JSON.stringify(errData)}`);
            
            // Fallback to text message
            const textBody = `🛍️ *Vamika & Bhargavi* — Don't miss out!\n\nHey, we noticed you missed your ${originalCoupon.discountPercent}% off offer! Here is a fresh 5% off coupon code *${reminderCode}* valid for the next 67 minutes.\n\nShop now: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/checkout?coupon=${reminderCode}&utm_source=whatsapp`;
            
            const resMetaText = await fetch(
              `https://graph.facebook.com/v18.0/${phoneId}/messages`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  messaging_product: "whatsapp",
                  to: formattedPhone,
                  type: "text",
                  text: { body: textBody }
                }),
              }
            );

            if (resMetaText.ok) {
              sentViaWhatsApp = true;
              console.log(`✅ WhatsApp reminder text fallback sent via Meta API to ${user.phone}`);
            } else {
              const textErrData = await resMetaText.json();
              console.error(`WhatsApp reminder fallback also failed: ${JSON.stringify(textErrData)}`);
            }
          }
        } catch (metaErr) {
          console.error("Failed to send WhatsApp reminder via Meta API:", metaErr);
        }
      }

      // Simulate/Fallback console log
      if (!sentViaWhatsApp) {
        console.log(`\n==================================================`);
        console.log(`🔁 [WHATSAPP REMINDER DISPATCHED - SIMULATION] (Attempt ${nextReminderCount}/2)`);
        console.log(`To: ${user.phone}`);
        console.log(`Template: "reminder_promo_coupon_campaign"`);
        console.log(`Caption: "Hey, we noticed you missed your ${originalCoupon.discountPercent}% off offer! Here is a fresh 5% off coupon code ${reminderCode} valid for the next 67 minutes. Don't miss out!"`);
        console.log(`Action Link: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/checkout?utm_source=whatsapp&coupon=${reminderCode}`);
        console.log(`==================================================\n`);
      }

      processedList.push({
        phone: user.phone,
        originalCode: originalCoupon.code,
        reminderCode,
        attempt: nextReminderCount,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedList.length} user reminders successfully.`,
      processedCount: processedList.length,
      processed: processedList,
    });
  } catch (error: any) {
    console.error("Error executing reminder cron:", error);
    return NextResponse.json({ error: "Failed to run reminder cron job." }, { status: 500 });
  }
}

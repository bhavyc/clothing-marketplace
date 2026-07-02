import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 401 });
    }

    const { id } = await params;

    // 1. Fetch Campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
    }

    if (campaign.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Broadcast blocked. Only templates approved by Meta (APPROVED status) can be dispatched." },
        { status: 400 }
      );
    }

    // 2. Fetch and activate the linked Coupon for exactly 67 minutes
    const now = new Date();
    const expiration = new Date(now.getTime() + 67 * 60 * 1000); // 67 minutes validity

    const coupon = await prisma.coupon.findUnique({
      where: { code: campaign.couponCode },
    });

    if (coupon) {
      await prisma.coupon.update({
        where: { code: campaign.couponCode },
        data: {
          isActive: true,
          startTime: now,
          endTime: expiration,
          triggerFreeGift: true, // Mark this coupon as eligible for the 7th order free gift flow
        },
      });
    }

    // 3. Find target users based on Campaign Segment Tag (All options strictly enforce optInWhatsApp: true)
    let segmentFilter: any = {
      optInWhatsApp: true,
      phone: { not: null },
    };

    if (campaign.segmentTag === "VIP") {
      // VIP customers: Opted-in users who have placed at least 1 order in the past
      segmentFilter.orders = {
        some: {},
      };
    } else if (campaign.segmentTag === "ABANDONED_CART") {
      // Abandoned Carts: Opted-in users who have logged in/registered but have placed 0 orders
      segmentFilter.orders = {
        none: {},
      };
    }

    const targetUsers = await prisma.user.findMany({
      where: segmentFilter,
    });

    if (targetUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users have opted-in for WhatsApp promotions yet.",
        dispatchedCount: 0,
      });
    }

    // 4. Create MessageLog entries and CouponSent tracking records for all target users
    const createdLogs = [];
    for (const user of targetUsers) {
      // Clear any existing logs for this user/campaign to prevent primary key overlap
      await prisma.messageLog.deleteMany({
        where: { campaignId: campaign.id, userId: user.id },
      });

      const log = await prisma.messageLog.create({
        data: {
          campaignId: campaign.id,
          userId: user.id,
          status: "SENT",
        },
      });
      createdLogs.push(log);

      // Track the sent coupon for this user
      if (coupon) {
        await prisma.couponSent.deleteMany({
          where: { userId: user.id, couponId: coupon.id },
        });

        await prisma.couponSent.create({
          data: {
            userId: user.id,
            couponId: coupon.id,
            used: false,
            reminderCount: 0,
          },
        });
      }

      // Simulate sending WhatsApp payload using Meta's templating structure
      console.log(`\n==================================================`);
      console.log(`🟢 [META WHATSAPP BUSINESS API CALLED]`);
      console.log(`To: ${user.phone}`);
      console.log(`Template Name: ${campaign.templateName}`);
      console.log(`Language: en_US`);
      console.log(`Components: [`);
      console.log(`  { type: "header", parameters: [{ type: "image", image: { link: "${campaign.bannerUrl}" } }] },`);
      console.log(`  { type: "body", parameters: [{ type: "text", text: "${campaign.couponCode}" }, { type: "text", text: "${coupon?.minOrderValue || '3000'}" }] },`);
      console.log(`  { type: "button", sub_type: "url", index: 0, parameters: [{ type: "text", text: "?coupon=${campaign.couponCode}&utm_source=whatsapp" }] }`);
      console.log(`]`);
      console.log(`==================================================\n`);
    }

    // 5. Trigger async webhook simulations (simulating Meta WhatsApp response hooks)
    // We update statuses in the background to show real-time progress to the admin
    createdLogs.forEach((log) => {
      // Simulate DELIVERED webhook callback after 2 seconds
      setTimeout(async () => {
        try {
          await prisma.messageLog.update({
            where: { id: log.id },
            data: { status: "DELIVERED" },
          });
          console.log(`💬 [WHATSAPP WEBHOOK SIMULATOR] Message ${log.id} status updated to DELIVERED`);
        } catch (e) {
          // ignore async errors
        }
      }, 3000);

      // Simulate READ webhook callback after 5 seconds
      setTimeout(async () => {
        try {
          await prisma.messageLog.update({
            where: { id: log.id },
            data: { status: "READ" },
          });
          console.log(`💬 [WHATSAPP WEBHOOK SIMULATOR] Message ${log.id} status updated to READ`);
        } catch (e) {
          // ignore async errors
        }
      }, 7000);
    });

    return NextResponse.json({
      success: true,
      message: `Successfully dispatched campaign message to ${targetUsers.length} users. Coupon activated for 67 minutes.`,
      dispatchedCount: targetUsers.length,
    });
  } catch (error: any) {
    console.error("Error sending campaign:", error);
    return NextResponse.json({ error: "Failed to dispatch campaign." }, { status: 500 });
  }
}

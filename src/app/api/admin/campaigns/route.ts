import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 401 });
    }

    const campaigns = await prisma.campaign.findMany({
      include: {
        messageLogs: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedCampaigns = campaigns.map((campaign) => {
      const logs = campaign.messageLogs;
      const totalSent = logs.length;
      const delivered = logs.filter((l) => l.status === "DELIVERED" || l.status === "READ").length;
      const read = logs.filter((l) => l.status === "READ").length;
      const failed = logs.filter((l) => l.status === "FAILED").length;

      return {
        ...campaign,
        stats: {
          sent: totalSent,
          delivered,
          read,
          failed,
          ctr: totalSent > 0 ? Math.round((read / totalSent) * 100) : 0,
        },
      };
    });

    const couponDispatches = await prisma.couponSent.findMany({
      include: {
        user: true,
        coupon: true,
      },
      orderBy: { sentAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      campaigns: formattedCampaigns,
      dispatches: couponDispatches,
    });
  } catch (error: any) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 401 });
    }

    const { name, bannerUrl, captionText, couponCode, segmentTag } = await req.json();

    if (!name || !bannerUrl || !captionText || !couponCode) {
      return NextResponse.json(
        { error: "Campaign name, banner, caption, and coupon code are required." },
        { status: 400 }
      );
    }

    // 1. Verify coupon exists
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: `Linked coupon code "${couponCode}" does not exist. Please create the coupon first.` },
        { status: 400 }
      );
    }

    // 2. Create the campaign
    const campaign = await prisma.campaign.create({
      data: {
        name,
        bannerUrl,
        captionText,
        couponCode: couponCode.toUpperCase(),
        segmentTag: segmentTag || "ALL",
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    return NextResponse.json({ error: "Failed to create campaign." }, { status: 500 });
  }
}

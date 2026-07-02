import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      // 1. Get all coupon codes linked to campaigns to exclude them
      const campaigns = await prisma.campaign.findMany({
        select: { couponCode: true }
      });
      const campaignCouponCodes = campaigns.map(c => c.couponCode.toUpperCase());

      // 2. Exclude time-restricted and campaign-linked coupons from public list
      const coupons = await prisma.coupon.findMany({
        where: { 
          isActive: true,
          startTime: null,
          endTime: null,
          code: {
            notIn: campaignCouponCodes
          }
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ coupons });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code." },
        { status: 404 }
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { error: "This coupon has expired." },
        { status: 400 }
      );
    }

    const now = new Date();
    if (coupon.startTime && now < new Date(coupon.startTime)) {
      return NextResponse.json(
        { error: "This coupon campaign has not started yet." },
        { status: 400 }
      );
    }

    if (coupon.endTime && now > new Date(coupon.endTime)) {
      return NextResponse.json(
        { error: "This coupon campaign has expired (67 minutes window exceeded)." },
        { status: 400 }
      );
    }

    if (coupon.currentUsage >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "This coupon has reached its maximum usage limit." },
        { status: 400 }
      );
    }

    return NextResponse.json({ coupon });
  } catch (error: any) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon information." },
      { status: 500 }
    );
  }
}

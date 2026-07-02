import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin credentials required." },
        { status: 401 }
      );
    }

    // 1. Calculate stats
    const totalOrdersCount = await prisma.order.count();
    const paidOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
      },
      select: {
        totalAmount: true,
      },
    });

    const totalSalesAmount = paidOrders.reduce((acc, order) => acc + order.totalAmount, 0);
    // Platform commission is 10% under Model A
    const commissionEarned = totalSalesAmount * 0.10;

    const pendingSellersCount = await prisma.sellerProfile.count({
      where: { isApproved: false },
    });

    const activeCouponsCount = await prisma.coupon.count({
      where: { isActive: true },
    });

    const stats = {
      totalSales: totalSalesAmount,
      totalOrders: totalOrdersCount,
      commissionEarned: commissionEarned,
      pendingSellers: pendingSellersCount,
      activeCoupons: activeCouponsCount,
    };

    // 2. Fetch all sellers
    const sellers = await prisma.sellerProfile.findMany({
      include: {
        user: {
          select: { email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Fetch all coupons
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    // 4. Fetch all products
    const products = await prisma.product.findMany({
      include: {
        seller: {
          select: { shopName: true },
        },
        variants: {
          select: { price: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      stats,
      sellers,
      coupons,
      products,
    });
  } catch (error: any) {
    console.error("Admin dashboard fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to compile administrative dashboard data." },
      { status: 500 }
    );
  }
}

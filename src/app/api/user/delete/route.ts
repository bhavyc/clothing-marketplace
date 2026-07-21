import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getUserSession(req);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // 1. Unlink orders from this user (set userId to null) to avoid FK constraint violations
    await prisma.order.updateMany({
      where: { userId: userId },
      data: { userId: null },
    });

    // 2. Delete the user (this cascades to Cart, CouponSent, SellerProfile)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "Account and associated data deleted successfully.",
    });
  } catch (error: any) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete account." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });

    return NextResponse.json({
      success: true,
      walletBalance: user?.walletBalance || 0,
    });
  } catch (error: any) {
    console.error("Wallet balance retrieval error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve wallet balance." },
      { status: 500 }
    );
  }
}

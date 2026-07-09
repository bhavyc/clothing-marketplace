import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getUserSession(req);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        walletBalance: true 
      },
    });

    return NextResponse.json({
      success: true,
      walletBalance: user?.walletBalance || 0,
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        phone: user?.phone,
        role: user?.role,
      }
    });
  } catch (error: any) {
    console.error("Wallet balance retrieval error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve wallet balance." },
      { status: 500 }
    );
  }
}

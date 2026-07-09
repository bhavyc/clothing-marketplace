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

    const users = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        walletBalance: true,
        optInWhatsApp: true,
        createdAt: true,
        orders: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            shippingAddress: true,
            city: true,
            state: true,
            pincode: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Error fetching admin users list:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load users list." },
      { status: 500 }
    );
  }
}

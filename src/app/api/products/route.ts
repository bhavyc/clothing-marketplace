import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get("tier"); // Optional: LUXE or INDI
    const category = searchParams.get("category");

    const whereClause: any = {};
    if (tier) {
      whereClause.tier = tier;
    }
    if (category) {
      whereClause.category = category;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        seller: {
          select: { shopName: true },
        },
        variants: true,
        options: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error("Failed to fetch products API:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

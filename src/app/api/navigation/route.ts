import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const revalidate = 0; // Fetch fresh navigation links

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") === "INDI" ? "INDI" : "LUXE";

    // Retrieve unique categories and collections associated with the selected tier
    const products = await prisma.product.findMany({
      where: {
        tier: mode,
      },
      select: {
        category: true,
        collection: true,
      },
    });

    const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    const collections = Array.from(
      new Set(products.map((p) => p.collection).filter(Boolean))
    ) as string[];

    return NextResponse.json({ categories, collections });
  } catch (error: any) {
    console.error("Error fetching dynamic navigation categories/collections:", error);
    return NextResponse.json(
      { categories: [], collections: [] },
      { status: 500 }
    );
  }
}

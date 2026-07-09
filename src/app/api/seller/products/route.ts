import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "SELLER") {
      return NextResponse.json(
        { error: "Unauthorized. Merchant credentials required." },
        { status: 401 }
      );
    }

    const sellerProfileId = (session.user as any).sellerProfileId;
    if (!sellerProfileId) {
      return NextResponse.json(
        { error: "Seller profile not found for this user." },
        { status: 404 }
      );
    }

    const products = await prisma.product.findMany({
      where: { sellerId: sellerProfileId },
      include: {
        variants: true,
        options: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Error fetching merchant products:", error);
    return NextResponse.json(
      { error: "Failed to load listed silhouettes." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "SELLER") {
      return NextResponse.json(
        { error: "Unauthorized. Merchant credentials required." },
        { status: 401 }
      );
    }

    const sellerProfileId = (session.user as any).sellerProfileId;
    if (!sellerProfileId) {
      return NextResponse.json(
        { error: "Seller profile not found for this user." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      category,
      collection,
      fabricDetails,
      careInstructions,
      deliveryTimeline,
      isSet,
      tier,
      topLength,
      pantLength,
      sleeveLength,
      images, // JSON string array of URLs
      variants, // Array of { topSize, bottomSize, price, stock }
      options, // Array of { optionName, optionValue, priceAdjustment }
      sizeChartType,
      sizeChartData,
    } = body;

    if (!title || !description || !category || !variants || variants.length === 0) {
      return NextResponse.json(
        { error: "Title, description, category and size variants are required." },
        { status: 400 }
      );
    }

    // Run transaction to create product, variants, and options
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          title,
          description,
          category,
          collection,
          fabricDetails,
          careInstructions,
          deliveryTimeline,
          isSet,
          tier: tier === "INDI" ? "INDI" : "LUXE",
          topLength,
          pantLength: isSet ? pantLength : null,
          sleeveLength,
          images,
          sellerId: sellerProfileId,
          sizeChartType: sizeChartType || "STANDARD",
          sizeChartData: sizeChartData || null,
        },
      });

      // Create variants
      const variantsData = variants.map((v: any) => ({
        productId: product.id,
        topSize: v.topSize || null,
        bottomSize: isSet ? (v.bottomSize || null) : null,
        price: parseFloat(v.price),
        stock: parseInt(v.stock),
      }));

      await tx.productVariant.createMany({
        data: variantsData,
      });

      // Create options (if present)
      if (options && options.length > 0) {
        const optionsData = options.map((o: any) => ({
          productId: product.id,
          optionName: o.optionName,
          optionValue: o.optionValue,
          priceAdjustment: parseFloat(o.priceAdjustment),
        }));

        await tx.productOption.createMany({
          data: optionsData,
        });
      }

      return product;
    });

    return NextResponse.json({ success: true, product: result });
  } catch (error: any) {
    console.error("Error creating merchant product listing:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create silhouette listing." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "SELLER") {
      return NextResponse.json(
        { error: "Unauthorized. Merchant credentials required." },
        { status: 401 }
      );
    }

    const sellerProfileId = (session.user as any).sellerProfileId;
    if (!sellerProfileId) {
      return NextResponse.json(
        { error: "Seller profile not found for this user." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { productId, discountPercent, variants } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );
    }

    let parsedDiscount: number | undefined;
    if (discountPercent !== undefined) {
      parsedDiscount = parseFloat(discountPercent);
      if (isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
        return NextResponse.json(
          { error: "Discount percentage must be a valid number between 0 and 100." },
          { status: 400 }
        );
      }
    }

    if (variants !== undefined && !Array.isArray(variants)) {
      return NextResponse.json(
        { error: "Variants must be an array." },
        { status: 400 }
      );
    }

    // Verify ownership
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        sellerId: sellerProfileId,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or access denied." },
        { status: 404 }
      );
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // 1. Update discount percent if provided
      if (parsedDiscount !== undefined) {
        await tx.product.update({
          where: { id: productId },
          data: {
            discountPercent: parsedDiscount,
          },
        });
      }

      // 2. Update variants if provided
      if (variants && Array.isArray(variants)) {
        for (const v of variants) {
          if (!v.id) continue;
          await tx.productVariant.updateMany({
            where: {
              id: v.id,
              productId: productId,
            },
            data: {
              stock: parseInt(v.stock),
              price: parseFloat(v.price),
            },
          });
        }
      }

      return await tx.product.findUnique({
        where: { id: productId },
        include: {
          variants: true,
          options: true,
        },
      });
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error("Error updating product listing:", error);
    return NextResponse.json(
      { error: "Failed to update product listing." },
      { status: 500 }
    );
  }
}

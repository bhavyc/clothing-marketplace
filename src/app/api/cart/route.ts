import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ items: [] });
    }

    const userId = (session.user as any).id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    seller: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    const mappedItems = cart.items.map((item) => {
      const product = item.variant.product;
      let imagesList: string[] = [];
      try {
        imagesList = JSON.parse(product.images);
      } catch (e) {
        imagesList = [product.images];
      }

      let selectedOptionsList = [];
      try {
        selectedOptionsList = item.selectedOptions ? JSON.parse(item.selectedOptions) : [];
      } catch (e) {
        // ignore
      }

      const unitPrice = item.variant.price + selectedOptionsList.reduce((acc: number, opt: any) => acc + (opt.priceAdjustment || 0), 0);

      return {
        id: item.id,
        productId: product.id,
        productTitle: product.title,
        productImage: imagesList[0] || "",
        category: product.category,
        sellerShopName: product.seller.shopName,
        variantId: item.variant.id,
        topSize: item.variant.topSize,
        bottomSize: item.variant.bottomSize,
        basePrice: item.variant.price,
        selectedOptions: selectedOptionsList,
        quantity: item.quantity,
        unitPrice,
        deliveryTimeline: product.deliveryTimeline,
      };
    });

    return NextResponse.json({ items: mappedItems });
  } catch (error: any) {
    console.error("Failed to retrieve cart:", error);
    return NextResponse.json({ error: "Failed to retrieve cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { items } = body; // Array of frontend CartItem objects

    // 1. Ensure user has a cart in the database
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // 2. Clear old items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // 3. Insert new items
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (!item.variantId) continue;
        
        // Verify variantId exists in DB before adding to avoid ForeignKeyConstraintViolation
        const variantExists = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (variantExists) {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              variantId: item.variantId,
              quantity: item.quantity,
              selectedOptions: JSON.stringify(item.selectedOptions || []),
            },
          });
        } else {
          console.warn(`Skipped syncing cart item because variantId "${item.variantId}" does not exist in DB.`);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to sync cart:", error);
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 });
  }
}

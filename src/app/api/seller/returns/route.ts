import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Authenticate Seller
    if (!session || !session.user || (session.user as any).role !== "SELLER") {
      return NextResponse.json(
        { error: "Unauthorized. Seller privileges required." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // 2. Fetch Seller Profile
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!sellerProfile) {
      return NextResponse.json(
        { error: "Seller profile not found." },
        { status: 404 }
      );
    }

    // 3. Query all returned OrderItems belonging to this seller
    const returnedItems = await prisma.orderItem.findMany({
      where: {
        variant: {
          product: {
            sellerId: sellerProfile.id,
          },
        },
        returnStatus: {
          not: "NONE",
        },
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            createdAt: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            shippingAddress: true,
            city: true,
            state: true,
            pincode: true,
          },
        },
        variant: {
          include: {
            product: {
              select: {
                title: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // 4. Format returns payload
    const formattedReturns = returnedItems.map((item) => {
      let productImages: string[] = [];
      try {
        productImages = JSON.parse(item.variant.product.images);
      } catch (e) {
        if (typeof item.variant.product.images === "string") {
          productImages = [item.variant.product.images];
        }
      }

      return {
        id: item.id,
        orderId: item.order.id,
        orderNumber: item.order.orderNumber,
        orderDate: item.order.createdAt,
        customerName: item.order.customerName,
        customerEmail: item.order.customerEmail,
        customerPhone: item.order.customerPhone,
        shippingAddress: item.order.shippingAddress,
        city: item.order.city,
        state: item.order.state,
        pincode: item.order.pincode,
        productTitle: item.variant.product.title,
        productImage: productImages[0] || "/placeholder.jpg",
        topSize: item.variant.topSize,
        bottomSize: item.variant.bottomSize,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        selectedOptions: item.selectedOptions,
        returnStatus: item.returnStatus,
        returnQuantity: item.returnQuantity,
        returnReason: item.returnReason,
        updatedAt: item.updatedAt,
      };
    });

    return NextResponse.json({ success: true, returns: formattedReturns });
  } catch (error: any) {
    console.error("Seller returns fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch returns data." },
      { status: 500 }
    );
  }
}

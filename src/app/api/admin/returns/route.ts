import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Authenticate Admin
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 401 }
      );
    }

    // 2. Query all OrderItems requesting returns (where status is not NONE)
    const returnedItems = await prisma.orderItem.findMany({
      where: {
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
            user: {
              select: {
                name: true,
                email: true,
              },
            },
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

    // 3. Format return requests payload
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
        customerName: item.order.user?.name || "Guest Customer",
        customerEmail: item.order.user?.email || "No Email",
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
    console.error("Admin returns fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch returns data." },
      { status: 500 }
    );
  }
}

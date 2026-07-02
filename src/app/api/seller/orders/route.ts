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

    // Fetch orders containing products belonging to this seller
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            variant: {
              product: {
                sellerId: sellerProfileId,
              },
            },
          },
        },
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format orders for the seller view
    const formattedOrders = orders.map((order) => {
      // Only return items that belong to this seller
      const sellerItems = order.items.filter(
        (item) => item.variant.product.sellerId === sellerProfileId
      );

      const sellerSubtotal = sellerItems.reduce(
        (sum, item) => sum + item.quantity * item.priceAtPurchase,
        0
      );

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingAddress: `${order.shippingAddress}, ${order.city}, ${order.state} - ${order.pincode}`,
        paymentType: order.paymentType,
        paymentStatus: order.paymentStatus,
        status: order.status,
        trackingCompany: order.trackingCompany,
        trackingNumber: order.trackingNumber,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        items: sellerItems.map((item) => ({
          id: item.id,
          title: item.variant.product.title,
          image: JSON.parse(item.variant.product.images)[0],
          topSize: item.variant.topSize,
          bottomSize: item.variant.bottomSize,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase,
          selectedOptions: item.selectedOptions,
          returnStatus: item.returnStatus,
        })),
        sellerSubtotal,
      };
    });

    return NextResponse.json({ orders: formattedOrders });
  } catch (error: any) {
    console.error("Error fetching seller orders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load seller orders." },
      { status: 500 }
    );
  }
}

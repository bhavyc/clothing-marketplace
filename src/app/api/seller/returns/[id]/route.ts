import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // 3. Query the OrderItem by ID and include parent Order & Product variant details
    const item = await prisma.orderItem.findUnique({
      where: { id },
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
                sellerId: true,
              },
            },
          },
        },
      },
    });

    if (!item || item.returnStatus === "NONE") {
      return NextResponse.json(
        { error: "Return request not found." },
        { status: 404 }
      );
    }

    // 4. Access check: Ensure the item belongs to the authenticated seller
    if (item.variant.product.sellerId !== sellerProfile.id) {
      return NextResponse.json(
        { error: "Forbidden. This return request does not belong to your products." },
        { status: 403 }
      );
    }

    // 5. Format payload
    let productImages: string[] = [];
    try {
      productImages = JSON.parse(item.variant.product.images);
    } catch (e) {
      if (typeof item.variant.product.images === "string") {
        productImages = [item.variant.product.images];
      }
    }

    const formattedReturn = {
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

    return NextResponse.json({ success: true, returnRequest: formattedReturn });
  } catch (error: any) {
    console.error("Seller single return fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch return request details." },
      { status: 500 }
    );
  }
}

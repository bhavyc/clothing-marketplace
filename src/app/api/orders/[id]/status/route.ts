import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendShippingConfirmationEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    const userEmail = session.user.email;

    // Fetch the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    // Permission check
    if (userRole === "ADMIN") {
      // Admins can change any order status
    } else if (userRole === "SELLER") {
      // Sellers can only update status if the order has at least one of their items
      const sellerProfileId = (session.user as any).sellerProfileId;
      if (!sellerProfileId) {
        return NextResponse.json(
          { error: "Seller profile not found." },
          { status: 403 }
        );
      }

      const containsSellerItem = order.items.some(
        (item) => item.variant.product.sellerId === sellerProfileId
      );

      if (!containsSellerItem) {
        return NextResponse.json(
          { error: "Forbidden. This order does not contain your items." },
          { status: 403 }
        );
      }
    } else {
      // Customers cannot update order status
      return NextResponse.json(
        { error: "Forbidden. Unauthorized role." },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { status, trackingCompany, trackingNumber } = body;

    const allowedStatuses = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Update order
    const updatedData: any = {
      status,
    };

    if (trackingCompany !== undefined) {
      updatedData.trackingCompany = trackingCompany;
    }
    if (trackingNumber !== undefined) {
      updatedData.trackingNumber = trackingNumber;
    }

    // Extra timestamp details
    if (status === "SHIPPED") {
      updatedData.shippedAt = new Date();
    } else if (status === "DELIVERED") {
      updatedData.deliveredAt = new Date();
      updatedData.paymentStatus = "PAID"; // delivered orders are paid
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updatedData,
    });

    // Send shipping confirmation email if the status has transitioned to SHIPPED
    if (status === "SHIPPED") {
      sendShippingConfirmationEmail(orderId).catch((e) =>
        console.error("Failed to send shipping confirmation email in status update route:", e)
      );
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order status." },
      { status: 500 }
    );
  }
}

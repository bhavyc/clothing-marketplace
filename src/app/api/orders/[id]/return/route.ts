import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const session = await getUserSession(req);

    // 1. Authenticate user
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to request a return." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // 2. Parse request payload
    const body = await req.json();
    const { items } = body as {
      items: Array<{ orderItemId: string; quantity: number; reason: string }>;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid payload. Please select at least one item to return." },
        { status: 400 }
      );
    }

    // 3. Find order and include its items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // 4. Validate order ownership
    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized. You do not own this order." },
        { status: 403 }
      );
    }

    // 5. Verify the order is delivered
    if (order.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "Only delivered orders are eligible for return." },
        { status: 400 }
      );
    }

    // 6. Validate items and quantities
    const updates: Array<{ orderItemId: string; quantity: number; reason: string }> = [];
    for (const returnItem of items) {
      const orderItem = order.items.find((item) => item.id === returnItem.orderItemId);

      if (!orderItem) {
        return NextResponse.json(
          { error: `Item with ID ${returnItem.orderItemId} is not part of this order.` },
          { status: 400 }
        );
      }

      if (orderItem.returnStatus !== "NONE") {
        return NextResponse.json(
          { error: "Return has already been requested or processed for one of the items." },
          { status: 400 }
        );
      }

      if (returnItem.quantity <= 0 || returnItem.quantity > orderItem.quantity) {
        return NextResponse.json(
          { error: `Invalid return quantity for item. Purchased: ${orderItem.quantity}, Requested: ${returnItem.quantity}` },
          { status: 400 }
        );
      }

      if (!returnItem.reason?.trim()) {
        return NextResponse.json(
          { error: "Please provide a reason for the return request." },
          { status: 400 }
        );
      }

      updates.push({
        orderItemId: orderItem.id,
        quantity: returnItem.quantity,
        reason: returnItem.reason.trim(),
      });
    }

    // 7. Perform transaction to update status
    await prisma.$transaction(
      async (tx) => {
      // Update each item status
      for (const update of updates) {
        await tx.orderItem.update({
          where: { id: update.orderItemId },
          data: {
            returnStatus: "RETURN_REQUESTED",
            returnQuantity: update.quantity,
            returnReason: update.reason,
          },
        });
      }

      // Update main order status to reflect the return request
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "RETURN_REQUESTED",
        },
      });
    },
    {
      maxWait: 15000,
      timeout: 30000,
    });

    return NextResponse.json({
      success: true,
      message: "Return request submitted successfully. It will be reviewed by our team.",
    });
  } catch (error: any) {
    console.error("Return request processing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit return request." },
      { status: 500 }
    );
  }
}

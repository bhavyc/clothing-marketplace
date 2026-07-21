import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createRazorpayOrder } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await getUserSession(req);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to complete checkout." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      state,
      pincode,
      paymentType,
      couponId,
      items,
      useWallet,
    } = body;

    // Validation checks
    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !shippingAddress ||
      !city ||
      !state ||
      !pincode ||
      !items ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required order checkout details." },
        { status: 400 }
      );
    }

    // Process order inside a single database transaction
    const result = await prisma.$transaction(
      async (tx) => {
      // 1. Calculate items subtotal and verify variants exist
      let subtotal = 0;
      const orderItemsToCreate = [];

      for (const item of items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });

        if (!variant) {
          throw new Error(`Product variant ${item.variantId} not found.`);
        }

        if (variant.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${variant.product.title}". Only ${variant.stock} left in stock.`
          );
        }

        // Calculate unit price from database instead of relying on client
        // Fetch option details if options are selected
        let optionAdjustment = 0;
        let optionsDetailsList: any[] = [];
        try {
          if (item.selectedOptions) {
            const parsed = JSON.parse(item.selectedOptions);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const optionIds = parsed.map((opt: any) => opt.id);
              const dbOptions = await tx.productOption.findMany({
                where: { id: { in: optionIds } },
              });

              optionAdjustment = dbOptions.reduce((acc, opt) => acc + opt.priceAdjustment, 0);
              optionsDetailsList = dbOptions.map(o => `${o.optionName}: ${o.optionValue} (+Rs. ${o.priceAdjustment})`);
            }
          }
        } catch (e) {
          console.error("Failed to parse options during order placement:", e);
        }

        const discountPercent = variant.product.discountPercent || 0;
        const discountedBasePrice = discountPercent > 0 
          ? variant.price * (1 - discountPercent / 100) 
          : variant.price;

        const calculatedUnitPrice = discountedBasePrice + optionAdjustment;
        const itemTotal = calculatedUnitPrice * item.quantity;
        subtotal += itemTotal;

        // Deduct variant stock
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: { decrement: item.quantity } },
        });

        orderItemsToCreate.push({
          variantId: variant.id,
          quantity: item.quantity,
          priceAtPurchase: calculatedUnitPrice,
          selectedOptions: optionsDetailsList.length > 0 ? optionsDetailsList.join(", ") : null,
        });
      }

      // 2. Validate Coupon and calculate discount
      let discountAmount = 0;
      let couponUsedCode: string | null = null;
      if (couponId) {
        const coupon = await tx.coupon.findUnique({
          where: { id: couponId },
        });

        if (coupon && coupon.isActive) {
          const now = new Date();
          const isStartTimeValid = !coupon.startTime || now >= new Date(coupon.startTime);
          const isEndTimeValid = !coupon.endTime || now <= new Date(coupon.endTime);
          const isUsageLimitValid = coupon.currentUsage < coupon.usageLimit;
          const isMinOrderValid = subtotal >= coupon.minOrderValue;

          if (isStartTimeValid && isEndTimeValid && isUsageLimitValid && isMinOrderValid) {
            // If prepaid only but checkout is COD, don't apply discount
            const isPrepaidDiscountValid = !coupon.isPrepaidOnly || paymentType === "PREPAID";
            
            if (isPrepaidDiscountValid) {
              if (coupon.discountPercent > 0) {
                discountAmount = (subtotal * coupon.discountPercent) / 100;
              } else if (coupon.discountAmount > 0) {
                discountAmount = coupon.discountAmount;
              }
              // Cannot discount more than subtotal
              discountAmount = Math.min(discountAmount, subtotal);

              if (discountAmount > 0) {
                couponUsedCode = coupon.code;
                await tx.coupon.update({
                  where: { id: coupon.id },
                  data: { currentUsage: { increment: 1 } },
                });
              }
            }
          }
        }
      }

      const totalAmount = Math.max(0, subtotal - discountAmount);

      // Calculate Wallet Deduction if checked
      let walletDeduction = 0;
      if (useWallet) {
        const user = await tx.user.findUnique({
          where: { id: (session.user as any).id },
          select: { walletBalance: true },
        });
        const userWalletBalance = user?.walletBalance || 0;
        walletDeduction = Math.min(userWalletBalance, totalAmount);
        
        if (walletDeduction > 0) {
          await tx.user.update({
            where: { id: (session.user as any).id },
            data: {
              walletBalance: { decrement: walletDeduction },
            },
          });
        }
      }

      const finalTotalAmount = Math.round((totalAmount - walletDeduction) * 100) / 100;

      // 3. Generate Order Number
      const orderCount = await tx.order.count();
      const orderNumber = `KSH-${10000 + orderCount + 1}`;

      // Calculate if eligible for free gift (every 7th order)
      const userOrdersCount = await tx.order.count({
        where: { userId: (session.user as any).id },
      });
      const hasFreeGift = (userOrdersCount + 1) % 7 === 0;

      // 4. Create Order (Forced to PAID and WALLET type if fully covered, else PENDING)
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: (session.user as any).id,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          city,
          state,
          pincode,
          subtotal,
          discountAmount,
          totalAmount: finalTotalAmount,
          walletPaid: walletDeduction,
          paymentType: finalTotalAmount === 0 ? "WALLET" : "PREPAID",
          paymentStatus: finalTotalAmount === 0 ? "PAID" : "PENDING",
          status: "PLACED",
          couponUsed: couponUsedCode,
          hasFreeGift,
          items: {
            create: orderItemsToCreate,
          },
        },
      });

      // Update tracking record if a coupon was sent and applied
      if (couponId) {
        const activeCouponSent = await tx.couponSent.findFirst({
          where: {
            userId: (session.user as any).id,
            couponId: couponId,
            used: false,
          },
        });
        if (activeCouponSent) {
          await tx.couponSent.update({
            where: { id: activeCouponSent.id },
            data: { used: true },
          });
        }
      }

      return {
        orderNumber: newOrder.orderNumber,
        totalAmount: newOrder.totalAmount,
        walletPaid: newOrder.walletPaid,
      };
    },
    {
      maxWait: 15000,
      timeout: 30000,
    });

    // 5. Initiate external Razorpay order creation only if there is a remaining totalAmount > 0
    if (result.totalAmount > 0) {
      let razorpayOrder;
      try {
        // return order id 
        razorpayOrder = await createRazorpayOrder(result.totalAmount, result.orderNumber);
      } catch (error: any) {
        console.error("Razorpay order creation failed. Rolling back order in database...", error);
        // Rollback: delete order, restore variant stocks, and refund wallet if used
        await prisma.$transaction(
          async (tx) => {
          const order = await tx.order.findUnique({
            where: { orderNumber: result.orderNumber },
            include: { items: true },
          });
          if (order) {
            for (const item of order.items) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });
            }
            if (order.walletPaid > 0) {
              await tx.user.update({
                where: { id: order.userId as string },
                data: { walletBalance: { increment: order.walletPaid } },
              });
            }
            if (order.couponUsed) {
              const coupon = await tx.coupon.findUnique({
                where: { code: order.couponUsed },
              });
              if (coupon) {
                await tx.coupon.update({
                  where: { id: coupon.id },
                  data: { currentUsage: { decrement: 1 } },
                });
                await tx.couponSent.updateMany({
                  where: {
                    userId: order.userId as string,
                    couponId: coupon.id,
                    used: true,
                  },
                  data: { used: false },
                });
              }
            }
            await tx.order.delete({
              where: { id: order.id },
            });
          }
        },
        {
          maxWait: 15000,
          timeout: 30000,
        });
        return NextResponse.json(
          { error: "Payment gateway initiation failed. Please try again." },
          { status: 500 }
        );
      }

      // 6. Save Razorpay Order ID on order record temporarily in paymentId
      await prisma.order.update({
        where: { orderNumber: result.orderNumber },
        data: {
          paymentId: razorpayOrder.id,
        },
      });

      return NextResponse.json({
        success: true,
        orderNumber: result.orderNumber,
        totalAmount: result.totalAmount,
        razorpayOrderId: razorpayOrder.id,
      });
    } else {
      // Order is fully paid via wallet
      await prisma.order.update({
        where: { orderNumber: result.orderNumber },
        data: {
          paymentId: `wallet_paid_${result.orderNumber}`,
        },
      });

      // Send confirmation email in background
      sendOrderConfirmationEmail(result.orderNumber).catch((e) =>
        console.error("Failed to send order confirmation email for wallet order:", e)
      );

      return NextResponse.json({
        success: true,
        orderNumber: result.orderNumber,
        totalAmount: 0,
        razorpayOrderId: null,
      });
    }
  } catch (error: any) {
    console.error("Order creation transaction failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit order transaction." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getUserSession(req);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("orderNumber");

    if (orderNumber) {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
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

      // Authorization check (only owner or ADMIN can view)
      if (order.userId !== userId && (session.user as any).role !== "ADMIN") {
        return NextResponse.json(
          { error: "Unauthorized access to order details." },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        order,
      });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.error("Error retrieving orders:", error);
    return NextResponse.json(
      { error: "Failed to retrieve order details." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin credentials required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required." },
        { status: 400 }
      );
    }

    // Action: Provision / Create Official Seller
    if (action === "PROVISION_SELLER") {
      const { email, password, name, shopName, description } = body;

      if (!email || !shopName) {
        return NextResponse.json(
          { error: "Email and Shop Name are required." },
          { status: 400 }
        );
      }

      const formattedEmail = email.trim().toLowerCase();

      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email: formattedEmail },
        include: { sellerProfile: true },
      });

      if (user) {
        // Upgrade existing user to SELLER role
        const updateData: any = { role: "SELLER" };
        if (password && password.trim()) {
          updateData.password = await bcrypt.hash(password.trim(), 10);
        }
        if (name && name.trim()) {
          updateData.name = name.trim();
        }

        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
          include: { sellerProfile: true },
        });

        // Ensure SellerProfile exists
        let sellerProfile = user.sellerProfile;
        if (!sellerProfile) {
          sellerProfile = await prisma.sellerProfile.create({
            data: {
              userId: user.id,
              shopName: shopName.trim(),
              description: description || "",
              isApproved: true,
            },
          });
        } else {
          sellerProfile = await prisma.sellerProfile.update({
            where: { id: sellerProfile.id },
            data: {
              shopName: shopName.trim(),
              description: description !== undefined ? description : sellerProfile.description,
              isApproved: true,
            },
          });
        }

        return NextResponse.json({
          success: true,
          message: `User ${formattedEmail} upgraded to Seller partner successfully!`,
          seller: { ...sellerProfile, user: { email: user.email } },
        });
      } else {
        // Create new user with SELLER role
        if (!password || !password.trim()) {
          return NextResponse.json(
            { error: "Password is required for new seller account creation." },
            { status: 400 }
          );
        }

        const hashedPassword = await bcrypt.hash(password.trim(), 10);

        const result = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              name: name || shopName,
              email: formattedEmail,
              password: hashedPassword,
              role: "SELLER",
            },
          });

          const newProfile = await tx.sellerProfile.create({
            data: {
              userId: newUser.id,
              shopName: shopName.trim(),
              description: description || "",
              isApproved: true,
            },
          });

          return { ...newProfile, user: { email: newUser.email } };
        });

        return NextResponse.json({
          success: true,
          message: `Seller partner ${shopName} created successfully!`,
          seller: result,
        });
      }
    }

    // Action: Change Seller Password
    if (action === "CHANGE_SELLER_PASSWORD") {
      const { sellerId, newPassword } = body;

      if (!sellerId || !newPassword || !newPassword.trim()) {
        return NextResponse.json(
          { error: "Seller ID and new password are required." },
          { status: 400 }
        );
      }

      if (newPassword.trim().length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      // Find seller profile to locate the linked user account
      const seller = await prisma.sellerProfile.findUnique({
        where: { id: sellerId },
        include: { user: true },
      });

      if (!seller || !seller.user) {
        return NextResponse.json(
          { error: "Seller profile or associated user account not found." },
          { status: 404 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);

      await prisma.user.update({
        where: { id: seller.user.id },
        data: { password: hashedPassword },
      });

      return NextResponse.json({
        success: true,
        message: `Password updated successfully for seller "${seller.shopName}" (${seller.user.email}).`,
      });
    }

    // Action: Approve Seller Profile
    if (action === "APPROVE_SELLER") {
      const { sellerId } = body;
      if (!sellerId) {
        return NextResponse.json({ error: "Seller ID is required." }, { status: 450 });
      }

      const updated = await prisma.sellerProfile.update({
        where: { id: sellerId },
        data: { isApproved: true },
      });

      return NextResponse.json({ success: true, seller: updated });
    }

    // Action: Create Coupon Code
    if (action === "CREATE_COUPON") {
      const { code, description, discountPercent, discountAmount, minOrderValue, isPrepaidOnly } = body;

      if (!code) {
        return NextResponse.json({ error: "Coupon code is required." }, { status: 400 });
      }

      // Check if code already exists
      const existing = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (existing) {
        return NextResponse.json(
          { error: `Coupon code "${code}" already exists.` },
          { status: 400 }
        );
      }

      const coupon = await prisma.coupon.create({
        data: {
          code: code.toUpperCase(),
          description,
          discountPercent: parseFloat(discountPercent) || 0.0,
          discountAmount: parseFloat(discountAmount) || 0.0,
          minOrderValue: parseFloat(minOrderValue) || 0.0,
          isPrepaidOnly: !!isPrepaidOnly,
          isActive: true,
        },
      });

      return NextResponse.json({ success: true, coupon });
    }

    // Action: Toggle Coupon Active Status
    if (action === "TOGGLE_COUPON") {
      const { couponId } = body;
      if (!couponId) {
        return NextResponse.json({ error: "Coupon ID is required." }, { status: 400 });
      }

      const coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
      });

      if (!coupon) {
        return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
      }

      const updated = await prisma.coupon.update({
        where: { id: couponId },
        data: { isActive: !coupon.isActive },
      });

      return NextResponse.json({ success: true, coupon: updated });
    }

    // Action: Delete Coupon Code Permanently
    if (action === "DELETE_COUPON") {
      const { couponId } = body;
      if (!couponId) {
        return NextResponse.json({ error: "Coupon ID is required." }, { status: 400 });
      }

      const coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
      });

      if (!coupon) {
        return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
      }

      await prisma.coupon.delete({
        where: { id: couponId },
      });

      return NextResponse.json({ success: true, message: "Coupon deleted permanently." });
    }

    // Action: Delete Product Listed Permanently (Cascading)
    if (action === "DELETE_PRODUCT") {
      const { productId } = body;
      if (!productId) {
        return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { variants: true },
      });

      if (!product) {
        return NextResponse.json({ error: "Product not found." }, { status: 404 });
      }

      await prisma.$transaction(
        async (tx) => {
          const variantIds = product.variants.map((v) => v.id);

          // 1. Delete associated OrderItems referencing this product's variants
          await tx.orderItem.deleteMany({
            where: { variantId: { in: variantIds } },
          });

          // 2. Delete associated CartItems referencing this product's variants
          await tx.cartItem.deleteMany({
            where: { variantId: { in: variantIds } },
          });

          // 3. Delete associated ProductOptions
          await tx.productOption.deleteMany({
            where: { productId },
          });

          // 4. Delete associated ProductVariants
          await tx.productVariant.deleteMany({
            where: { productId },
          });

          // 5. Finally, delete the Product record itself
          await tx.product.delete({
            where: { id: productId },
          });
        },
        {
          maxWait: 15000,
          timeout: 30000,
        }
      );

      return NextResponse.json({
        success: true,
        message: "Product and all its variants/options deleted successfully.",
      });
    }

    // Action: Toggle Product Bestseller Status
    if (action === "TOGGLE_BESTSELLER") {
      const { productId } = body;
      if (!productId) {
        return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return NextResponse.json({ error: "Product not found." }, { status: 404 });
      }

      const updated = await prisma.product.update({
        where: { id: productId },
        data: { isBestseller: !product.isBestseller },
      });

      return NextResponse.json({ success: true, product: updated });
    }

    // Action: Seed / Populate Dummy Data for App Store & Store Demo
    if (action === "SEED_DUMMY_DATA") {
      const { populateDummyData } = await import("@/lib/seed-dummy-data");
      const seedResult = await populateDummyData();
      return NextResponse.json({
        success: true,
        message: seedResult.message || "Dummy data populated successfully!",
        data: seedResult,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error("Admin actions failure:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process admin action request." },
      { status: 500 }
    );
  }
}

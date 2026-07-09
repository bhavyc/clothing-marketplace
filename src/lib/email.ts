import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOrderConfirmationEmail(orderIdOrNumber: string) {
  try {
    // 1. Fetch order details from database
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderIdOrNumber },
          { orderNumber: orderIdOrNumber }
        ]
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              }
            }
          }
        }
      }
    });

    if (!order) {
      console.error(`Order helper: Order not found for ${orderIdOrNumber}`);
      return;
    }

    // 2. Build items HTML list
    let itemsHtml = "";
    for (const item of order.items) {
      const product = item.variant.product;
      const sizeDesc = [
        item.variant.topSize ? `Top: ${item.variant.topSize}` : null,
        item.variant.bottomSize ? `Bottom: ${item.variant.bottomSize}` : null,
      ].filter(Boolean).join(", ");

      let optionsHtml = "";
      if (item.selectedOptions) {
        try {
          const parsed = JSON.parse(item.selectedOptions);
          if (Array.isArray(parsed) && parsed.length > 0) {
            optionsHtml = `<div style="font-size: 11px; color: #888888; margin-top: 4px;">Options: ${parsed.map((o: any) => `${o.optionName}: ${o.optionValue}`).join(", ")}</div>`;
          }
        } catch (e) {
          optionsHtml = `<div style="font-size: 11px; color: #888888; margin-top: 4px;">Options: ${item.selectedOptions}</div>`;
        }
      }

      itemsHtml += `
        <tr style="border-bottom: 1px solid #FAF6F0;">
          <td style="padding: 12px 0; vertical-align: top;">
            <div style="font-family: sans-serif; font-size: 13px; font-weight: bold; color: #1A1A1A;">
              ${product.title}
            </div>
            <div style="font-family: sans-serif; font-size: 11px; color: #666666; margin-top: 4px;">
              ${sizeDesc}
            </div>
            ${optionsHtml}
            <div style="font-family: sans-serif; font-size: 11px; color: #666666; margin-top: 4px;">
              Delivery timeline: ${product.deliveryTimeline || "10-15 Days"}
            </div>
          </td>
          <td style="padding: 12px 0; vertical-align: top; text-align: center; font-family: sans-serif; font-size: 13px; color: #1A1A1A; width: 60px;">
            x ${item.quantity}
          </td>
          <td style="padding: 12px 0; vertical-align: top; text-align: right; font-family: sans-serif; font-size: 13px; font-weight: bold; color: #1A1A1A; width: 100px;">
            Rs. ${item.priceAtPurchase.toLocaleString("en-IN")}
          </td>
        </tr>
      `;
    }

    // 3. Build order confirmation HTML email
    const mailOptions = {
      from: `"Vamika & Bhargavi Boutique" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject: `Order Placed Successfully — ${order.orderNumber}`,
      html: `
        <div style="font-family: 'Playfair Display', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #E8DFC8; background-color: #FAF8F5;">
          <h2 style="color: #1A1A1A; text-align: center; text-transform: lowercase; font-weight: 500; font-size: 26px; margin-bottom: 30px;">
            vamika <span style="font-style: italic; color: #D4AF37;">&</span> bhargavi
          </h2>
          
          <div style="background-color: #FFFFFF; padding: 30px; border: 1px solid #FAF6F0; border-radius: 4px;">
            <h3 style="font-family: sans-serif; font-size: 16px; font-weight: bold; color: #1A1A1A; text-transform: uppercase; letter-spacing: 0.1em; text-align: center; margin-top: 0; margin-bottom: 20px;">
              Order Confirmed
            </h3>
            <p style="font-family: sans-serif; font-size: 13px; color: #4A4A4A; line-height: 1.6; text-align: center; margin-bottom: 30px;">
              Thank you for shopping with us, <strong>${order.customerName}</strong>. Your order has been successfully placed. Below are your order summary and delivery details.
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <thead>
                <tr style="border-bottom: 1px solid #E8DFC8; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em; color: #888888; font-family: sans-serif;">
                  <th style="text-align: left; padding-bottom: 8px;">Item</th>
                  <th style="text-align: center; padding-bottom: 8px; width: 60px;">Qty</th>
                  <th style="text-align: right; padding-bottom: 8px; width: 100px;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Summary Totals -->
            <div style="border-top: 1px solid #E8DFC8; padding-top: 15px; font-family: sans-serif; font-size: 13px; color: #4A4A4A;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Subtotal</span>
                <span style="font-weight: bold; margin-left: auto;">Rs. ${order.subtotal.toLocaleString("en-IN")}</span>
              </div>
              ${
                order.discountAmount > 0
                  ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #B33A3A;">
                <span>Discount Applied</span>
                <span style="font-weight: bold; margin-left: auto;">- Rs. ${order.discountAmount.toLocaleString("en-IN")}</span>
              </div>`
                  : ""
              }
              ${
                order.walletPaid > 0
                  ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #4A4A4A;">
                <span>Paid via Wallet</span>
                <span style="font-weight: bold; margin-left: auto;">- Rs. ${order.walletPaid.toLocaleString("en-IN")}</span>
              </div>`
                  : ""
              }
              <div style="display: flex; justify-content: space-between; border-top: 1px solid #FAF6F0; padding-top: 12px; font-size: 15px; font-weight: bold; color: #1A1A1A;">
                <span>Final Amount Paid</span>
                <span style="margin-left: auto;">Rs. ${order.totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <!-- Delivery Details -->
          <div style="background-color: #FFFFFF; padding: 30px; border: 1px solid #FAF6F0; border-radius: 4px; margin-top: 20px; font-family: sans-serif;">
            <h4 style="font-size: 13px; font-weight: bold; color: #1A1A1A; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0; margin-bottom: 15px;">
              Delivery & Shipping Details
            </h4>
            <div style="font-size: 13px; color: #4A4A4A; line-height: 1.6;">
              <strong>Delivery Address:</strong><br />
              ${order.customerName}<br />
              ${order.shippingAddress}<br />
              ${order.city}, ${order.state} - ${order.pincode}<br />
              <strong>Phone:</strong> ${order.customerPhone}
            </div>
          </div>

          <p style="text-align: center; font-family: sans-serif; font-size: 10px; color: #999999; margin-top: 40px; text-transform: uppercase; letter-spacing: 0.1em;">
            © ${new Date().getFullYear()} Vamika & Bhargavi. All rights reserved.
          </p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✉️ [SMTP] Order confirmation email sent to ${order.customerEmail} for order ${order.orderNumber}`);
    } catch (mailError) {
      console.error(`Nodemailer failed to send order email for ${order.orderNumber}:`, mailError);
    }
  } catch (error) {
    console.error("Order confirmation email dispatcher error:", error);
  }
}

export async function sendShippingConfirmationEmail(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              }
            }
          }
        }
      }
    });

    if (!order) {
      console.error(`Shipping helper: Order not found for ID ${orderId}`);
      return;
    }

    if (!order.trackingNumber) {
      console.warn(`Shipping helper: No tracking number found for order ${order.orderNumber}`);
      return;
    }

    let itemsListHtml = "";
    for (const item of order.items) {
      const product = item.variant.product;
      itemsListHtml += `<li style="font-family: sans-serif; font-size: 13px; color: #4A4A4A; margin-bottom: 8px;">
        <strong>${product.title}</strong> (${item.variant.topSize ? `Top: ${item.variant.topSize}` : ""} ${item.variant.bottomSize ? `Bottom: ${item.variant.bottomSize}` : ""}) x ${item.quantity}
      </li>`;
    }

    const mailOptions = {
      from: `"Vamika & Bhargavi Boutique" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject: `Your Order ${order.orderNumber} Has Been Shipped!`,
      html: `
        <div style="font-family: 'Playfair Display', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #E8DFC8; background-color: #FAF8F5;">
          <h2 style="color: #1A1A1A; text-align: center; text-transform: lowercase; font-weight: 500; font-size: 26px; margin-bottom: 30px;">
            vamika <span style="font-style: italic; color: #D4AF37;">&</span> bhargavi
          </h2>
          
          <div style="background-color: #FFFFFF; padding: 30px; border: 1px solid #FAF6F0; border-radius: 4px;">
            <h3 style="font-family: sans-serif; font-size: 16px; font-weight: bold; color: #1A1A1A; text-transform: uppercase; letter-spacing: 0.1em; text-align: center; margin-top: 0; margin-bottom: 20px;">
              Your Order is on the Way
            </h3>
            <p style="font-family: sans-serif; font-size: 13px; color: #4A4A4A; line-height: 1.6; text-align: center; margin-bottom: 30px;">
              Great news, <strong>${order.customerName}</strong>! Your order <strong>${order.orderNumber}</strong> has been shipped by the seller and is currently in transit.
            </p>

            <!-- Tracking Card -->
            <div style="background-color: #FAF6F0; border: 1px solid #E8DFC8; padding: 20px; text-align: center; border-radius: 4px; margin-bottom: 30px; font-family: sans-serif;">
              <p style="font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 10px 0;">
                Tracking Information
              </p>
              <h4 style="font-size: 16px; font-weight: bold; color: #1A1A1A; margin: 0 0 8px 0;">
                ${order.trackingCompany || "Standard Delivery"}
              </h4>
              <p style="font-size: 13px; color: #4A4A4A; margin: 0 0 15px 0;">
                Tracking Number: <strong style="font-family: monospace; font-size: 14px; color: #1A1A1A;">${order.trackingNumber}</strong>
              </p>
              <div style="font-size: 11px; color: #666666;">
                Use the tracking number on the courier partner's portal to track delivery status.
              </div>
            </div>

            <!-- Items Shipped -->
            <div style="border-top: 1px solid #E8DFC8; padding-top: 20px; font-family: sans-serif;">
              <h4 style="font-size: 12px; font-weight: bold; color: #1A1A1A; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0; margin-bottom: 12px;">
                Items in This Shipment
              </h4>
              <ul style="margin: 0; padding-left: 20px;">
                ${itemsListHtml}
              </ul>
            </div>
          </div>

          <!-- Shipping details -->
          <div style="background-color: #FFFFFF; padding: 30px; border: 1px solid #FAF6F0; border-radius: 4px; margin-top: 20px; font-family: sans-serif;">
            <h4 style="font-size: 13px; font-weight: bold; color: #1A1A1A; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0; margin-bottom: 15px;">
              Delivery Address
            </h4>
            <div style="font-size: 13px; color: #4A4A4A; line-height: 1.6;">
              ${order.customerName}<br />
              ${order.shippingAddress}<br />
              ${order.city}, ${order.state} - ${order.pincode}
            </div>
          </div>

          <p style="text-align: center; font-family: sans-serif; font-size: 10px; color: #999999; margin-top: 40px; text-transform: uppercase; letter-spacing: 0.1em;">
            © ${new Date().getFullYear()} Vamika & Bhargavi. All rights reserved.
          </p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✉️ [SMTP] Shipping email sent to ${order.customerEmail} for order ${order.orderNumber}`);
    } catch (mailError) {
      console.error(`Nodemailer failed to send shipping email for ${order.orderNumber}:`, mailError);
    }
  } catch (error) {
    console.error("Shipping confirmation email dispatcher error:", error);
  }
}


import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // Standard verify token - can be configured in .env or defaults to a preset key
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "boutique_verify_token_123";

    if (mode === "subscribe" && token === verifyToken) {
      console.log("✅ [WHATSAPP WEBHOOK VERIFICATION] Webhook verified successfully by Meta.");
      return new Response(challenge, { status: 200 });
    }

    console.warn("❌ [WHATSAPP WEBHOOK VERIFICATION] Verification failed. Tokens did not match.");
    return new Response("Forbidden", { status: 403 });
  } catch (e) {
    console.error("Error verifying webhook:", e);
    return new Response("Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log("📥 [WHATSAPP WEBHOOK RECEIVED] Payload:", JSON.stringify(payload));

    let phone = "";
    let messageText = "";
    let status = "";
    let logId = "";

    // 1. Detect if it is a real Meta Cloud API webhook payload
    if (payload.object === "whatsapp_business_account" && payload.entry) {
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          const value = change.value;

          // Process incoming messages (e.g. user replies "STOP" to opt out)
          if (value.messages && value.messages.length > 0) {
            const msg = value.messages[0];
            if (msg.text && msg.text.body) {
              messageText = msg.text.body.trim();
              phone = "+" + msg.from; // Meta sends sender from id without "+" (e.g. 918383941267)
            }
          }

          // Process delivery status updates (sent, delivered, read, failed)
          if (value.statuses && value.statuses.length > 0) {
            const stat = value.statuses[0];
            const metaStatus = stat.status.toUpperCase();
            const recipientPhone = "+" + stat.recipient_id;

            // Map Meta states to our DB model options
            if (metaStatus === "SENT") status = "SENT";
            else if (metaStatus === "DELIVERED") status = "DELIVERED";
            else if (metaStatus === "READ") status = "READ";
            else if (metaStatus === "FAILED" || metaStatus === "EXPIRED") status = "FAILED";

            // Find the latest message log sent to this recipient to map the update
            const targetUser = await prisma.user.findFirst({
              where: { phone: recipientPhone },
              select: { id: true },
            });
            if (targetUser) {
              const latestLog = await prisma.messageLog.findFirst({
                where: { userId: targetUser.id },
                orderBy: { updatedAt: "desc" },
              });
              if (latestLog) {
                logId = latestLog.id;
              }
            }
          }
        }
      }
    } else {
      // 2. Fallback to simulation/admin API payload structure
      phone = payload.phone;
      messageText = payload.messageText;
      status = payload.status;
      logId = payload.logId;
    }

    // 3. Process Opt-Out request
    if (messageText && messageText.trim().toUpperCase() === "STOP" && phone) {
      const user = await prisma.user.findFirst({
        where: { phone },
      });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            optInWhatsApp: false,
            optInDate: null,
          },
        });
        console.log(`✉️ [WHATSAPP WEBHOOK OPT-OUT] User with phone ${phone} has unsubscribed (optInWhatsApp set to false).`);
        return NextResponse.json({ success: true, message: "Opt-out processed successfully." });
      }
      return NextResponse.json({ error: "User not found with this phone number." }, { status: 404 });
    }

    // 4. Process Message Log status update
    if (logId && status) {
      const logExists = await prisma.messageLog.findUnique({
        where: { id: logId },
      });

      if (!logExists) {
        return NextResponse.json({ error: "Message log record not found." }, { status: 404 });
      }

      await prisma.messageLog.update({
        where: { id: logId },
        data: { status },
      });

      console.log(`✉️ [WHATSAPP WEBHOOK LOG] Log ID: ${logId} status set to: ${status}`);
      return NextResponse.json({ success: true, message: "Webhook status updated successfully." });
    }

    return NextResponse.json({ success: true, message: "Webhook ignored or parsed without updates." });
  } catch (error: any) {
    console.error("Error processing WhatsApp webhook:", error);
    return NextResponse.json({ error: "Failed to process webhook." }, { status: 500 });
  }
}

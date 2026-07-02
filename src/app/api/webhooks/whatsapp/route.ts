import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { logId, status, messageText, phone } = payload;

    // Handle opt-out request ("STOP" command)
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
        console.log(`✉️ [WHATSAPP WEBHOOK OPT-OUT] User with phone ${phone} has been unsubscribed (optInWhatsApp set to false).`);
        return NextResponse.json({ success: true, message: "Opt-out processed successfully." });
      }
      return NextResponse.json({ error: "User not found with this phone number." }, { status: 404 });
    }

    if (!logId || !status) {
      return NextResponse.json({ error: "Missing logId or status parameters." }, { status: 400 });
    }

    if (!["SENT", "DELIVERED", "READ", "FAILED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }

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

    console.log(`✉️ [WHATSAPP WEBHOOK] Log ID: ${logId} status set to: ${status}`);

    return NextResponse.json({ success: true, message: "Webhook processed successfully." });
  } catch (error: any) {
    console.error("Error processing WhatsApp webhook:", error);
    return NextResponse.json({ error: "Failed to process webhook." }, { status: 500 });
  }
}

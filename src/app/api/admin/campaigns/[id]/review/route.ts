import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json();

    if (!action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be APPROVE or REJECT." }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
    }

    if (action === "APPROVE") {
      const generatedTemplateName = `promo_${campaign.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")}`;

      const updatedCampaign = await prisma.campaign.update({
        where: { id },
        data: {
          status: "APPROVED",
          templateName: generatedTemplateName,
          rejectReason: null,
        },
      });

      console.log(`✅ [META TEMPLATE REVIEW] Campaign "${campaign.name}" approved. TemplateName generated: ${generatedTemplateName}`);
      return NextResponse.json({ success: true, campaign: updatedCampaign });
    } else {
      const updatedCampaign = await prisma.campaign.update({
        where: { id },
        data: {
          status: "REJECTED",
          templateName: null,
          rejectReason: "Template contains aggressive marketing language or missing opt-out info.",
        },
      });

      console.log(`❌ [META TEMPLATE REVIEW] Campaign "${campaign.name}" rejected. Reason logged.`);
      return NextResponse.json({ success: true, campaign: updatedCampaign });
    }
  } catch (error: any) {
    console.error("Error updating template review status:", error);
    return NextResponse.json({ error: "Failed to update review status." }, { status: 500 });
  }
}

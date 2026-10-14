import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { populateDummyData } from "@/lib/seed-dummy-data";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const isDevKey = req.headers.get("x-seed-key") === "admin-demo-seed";
    const isAdmin = session?.user && (session.user as any).role === "ADMIN";

    if (!isAdmin && !isDevKey) {
      return NextResponse.json(
        { error: "Unauthorized. Admin credentials required." },
        { status: 401 }
      );
    }

    const result = await populateDummyData();

    return NextResponse.json({
      success: true,
      message: result.message || "Dummy store data seeded successfully!",
      data: result,
    });
  } catch (error: any) {
    console.error("Error seeding dummy store data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed dummy data." },
      { status: 500 }
    );
  }
}

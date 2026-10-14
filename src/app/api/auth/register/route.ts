import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, shopName, shopDescription } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required fields." },
        { status: 400 }
      );
    }

    // Public registration is restricted to CUSTOMER only
    // Single-seller and Admin accounts are provisioned securely and cannot be registered publicly
    const assignedRole = "CUSTOMER";

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email address already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: assignedRole,
        },
      });

      return user;
    },
    {
      maxWait: 15000,
      timeout: 30000,
    });

    const { password: _, ...userWithoutPassword } = result;

    return NextResponse.json(
      { message: "Registration successful.", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong during registration." },
      { status: 500 }
    );
  }
}

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { decode } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        phone: { label: "Phone", type: "text" },
      },
      async authorize(credentials) {
        if (credentials?.phone && credentials?.password === "OTP_VERIFIED") {
          const user = await prisma.user.findUnique({
            where: { phone: credentials.phone },
            include: { sellerProfile: true },
          });
          if (!user) {
            throw new Error("No user found with this phone number.");
          }
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            sellerProfileId: user.sellerProfile?.id || null,
          };
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { sellerProfile: true },
        });

        if (!user) {
          throw new Error("No user found with this email.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Incorrect password.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          sellerProfileId: user.sellerProfile?.id || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.sellerProfileId = (user as any).sellerProfileId;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).sellerProfileId = token.sellerProfileId;
        (session.user as any).phone = token.phone;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "boutique-secret-key-1234567890",
};

export async function getUserSession(req: NextRequest) {
  // 1. Try browser session first
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return session;
  }

  // 2. Try Bearer token in header
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const payloadString = Buffer.from(token, "base64").toString("utf-8");
      const decoded = JSON.parse(payloadString);
      if (decoded && decoded.id && decoded.expires > Date.now()) {
        return {
          user: {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role,
            phone: decoded.phone,
            sellerProfileId: decoded.sellerProfileId,
          }
        };
      }
    } catch (e) {
      console.error("Custom token decoding failed:", e);
    }
  }

  return null;
}

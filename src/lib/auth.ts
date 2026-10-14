import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { decode } from "next-auth/jwt";

import crypto from "crypto";

const AUTH_SECRET = process.env.NEXTAUTH_SECRET || "boutique-secret-key-1234567890";

export interface AuthTokenPayload {
  id: string;
  phone?: string | null;
  role?: string;
  email?: string;
  name?: string | null;
  sellerProfileId?: string | null;
  expires: number;
}

export function signAuthToken(payload: AuthTokenPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [data, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(data)
      .digest("base64url");

    if (
      signature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    ) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (!payload || !payload.id || !payload.expires || payload.expires < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

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
        // Secure Phone Login: validates cryptographically signed verification token or App Store demo credentials
        if (credentials?.phone && credentials?.password) {
          const rawPhone = credentials.phone.trim();
          const clean10 = rawPhone.replace(/\D/g, "").slice(-10);
          const normalizedPhone = `+91${clean10}`;
          const isDemo = ["9999999999", "9876543210", "8888888888", "0000000000"].includes(clean10) && 
            (credentials.password === "123456" || credentials.password === "1234");

          const verified = verifyAuthToken(credentials.password);
          if (isDemo || (verified && (verified.phone === credentials.phone || verified.phone === normalizedPhone))) {
            let user = await prisma.user.findFirst({
              where: {
                OR: [
                  { phone: credentials.phone },
                  { phone: normalizedPhone },
                  { phone: clean10 },
                ]
              },
              include: { sellerProfile: true },
            });

            if (!user && isDemo) {
              const hashedPassword = await bcrypt.hash("reviewer123456", 10);
              user = await prisma.user.create({
                data: {
                  email: "reviewer@apple.com",
                  name: "App Store Reviewer",
                  phone: normalizedPhone,
                  password: hashedPassword,
                  role: "CUSTOMER",
                  walletBalance: 2500.0,
                },
                include: { sellerProfile: true },
              });
            }

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

  // 2. Try Bearer token in header (verified using cryptographic HMAC)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const decoded = verifyAuthToken(token);
    if (decoded && decoded.id) {
      return {
        user: {
          id: decoded.id,
          email: decoded.email || "",
          name: decoded.name || "",
          role: decoded.role || "CUSTOMER",
          phone: decoded.phone || "",
          sellerProfileId: decoded.sellerProfileId || null,
        }
      };
    }
  }

  return null;
}

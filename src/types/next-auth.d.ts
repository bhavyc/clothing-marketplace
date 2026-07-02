import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      sellerProfileId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    sellerProfileId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    sellerProfileId: string | null;
  }
}

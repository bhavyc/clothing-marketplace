import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const DEMO_PHONE_NUMBER = "+919999999999";
export const DEMO_OTP = "123456";
export const DEMO_EMAIL = "reviewer@apple.com";
export const DEMO_NAME = "App Store Reviewer";

const DUMMY_PHONES_LIST = [
  "+919999999999",
  "+919876543210",
  "+918888888888",
  "+910000000000",
  "+911234567890",
];

export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return "";
  let cleaned = rawPhone.trim().replace(/[\s\-()]/g, "");
  if (/^\d{10}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }
  if (!cleaned.startsWith("+") && cleaned.startsWith("91") && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  return cleaned;
}

export function isDummyPhoneNumber(rawPhone: string): boolean {
  if (!rawPhone) return false;
  const normalized = normalizePhoneNumber(rawPhone);
  const rawClean = rawPhone.trim().replace(/\D/g, "");
  
  if (DUMMY_PHONES_LIST.includes(normalized)) return true;
  if (["9999999999", "9876543210", "8888888888", "0000000000", "1234567890"].includes(rawClean)) return true;

  const envTestPhone = process.env.APP_STORE_TEST_PHONE;
  if (envTestPhone && normalizePhoneNumber(envTestPhone) === normalized) {
    return true;
  }

  return false;
}

export async function getOrCreateDemoUser(phoneToUse: string = DEMO_PHONE_NUMBER) {
  const normalized = normalizePhoneNumber(phoneToUse) || DEMO_PHONE_NUMBER;
  const raw10 = normalized.replace("+91", "");

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: normalized },
        { phone: raw10 },
        { email: DEMO_EMAIL },
      ],
    },
    include: { sellerProfile: true },
  });

  const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  if (!user) {
    const hashedPassword = await bcrypt.hash("reviewer123456", 10);
    user = await prisma.user.create({
      data: {
        email: DEMO_EMAIL,
        name: DEMO_NAME,
        phone: normalized,
        password: hashedPassword,
        role: "CUSTOMER",
        walletBalance: 2500.0,
        resetOtp: DEMO_OTP,
        resetOtpExpires: oneYearFromNow,
        optInWhatsApp: true,
        optInDate: new Date(),
      },
      include: { sellerProfile: true },
    });
  } else {
    // Ensure demo user has active test credentials
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        phone: normalized,
        email: DEMO_EMAIL,
        name: DEMO_NAME,
        resetOtp: DEMO_OTP,
        resetOtpExpires: oneYearFromNow,
        walletBalance: user.walletBalance > 0 ? user.walletBalance : 2500.0,
      },
      include: { sellerProfile: true },
    });
  }

  return user;
}

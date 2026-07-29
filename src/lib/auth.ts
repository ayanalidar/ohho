import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "ohho-burgers-dev-secret-change-in-prod-2025"
);

const COOKIE_NAME = "ohho_session";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN";
  loyaltyPoints: number;
  walletBalance: number;
  referralCode: string;
  phone: string | null;
};

export async function signSession(user: SessionUser): Promise<string> {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    loyaltyPoints: user.loyaltyPoints,
    walletBalance: user.walletBalance,
    referralCode: user.referralCode,
    phone: user.phone,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as "CUSTOMER" | "ADMIN",
      loyaltyPoints: (payload.loyaltyPoints as number) || 0,
      walletBalance: (payload.walletBalance as number) || 0,
      referralCode: (payload.referralCode as string) || "",
      phone: (payload.phone as string) || null,
    };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

import crypto from "crypto";
import { cookies } from "next/headers";
import { AccessLevel } from "./teamAccess";

export type Permission =
  | "drives:read"
  | "drives:write"
  | "process:read"
  | "process:write"
  | "pipeline:read"
  | "pipeline:write"
  | "talents:read"
  | "talents:write";

export interface AuthSession {
  user: string;
  code: string;
  role: string;
  accessLevel: AccessLevel;
  department: string;
  permissions: Permission[];
  issuedAt: number;
}

export const ACCESS_LEVEL_PERMISSIONS: Record<AccessLevel, Permission[]> = {
  ALPHA_1: [
    "drives:read",
    "drives:write",
    "process:read",
    "process:write",
    "pipeline:read",
    "pipeline:write",
    "talents:read",
    "talents:write",
  ],
  BETA_2: [
    "drives:read",
    "process:read",
    "pipeline:read",
    "talents:read",
  ],
};

const AUTH_COOKIE_NAME = "nexturn_team_auth";
const SECRET = process.env.AUTH_SECRET || "nexturn_team_identification_secret_2026";

export function createToken(session: AuthSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const hmac = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${hmac}`;
}

export function verifyToken(token: string): AuthSession | null {
  try {
    const [payload, hmac] = token.split(".");
    if (!payload || !hmac) return null;
    const expectedHmac = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
    if (hmac !== expectedHmac) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as AuthSession;
    return session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function hasPermission(permission: Permission): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return session.permissions.includes(permission);
}

export const COOKIE_NAME = AUTH_COOKIE_NAME;

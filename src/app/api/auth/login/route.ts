import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createToken,
  COOKIE_NAME,
  ACCESS_LEVEL_PERMISSIONS,
  AuthSession,
} from "@/lib/auth";
import { lookupMemberByCode } from "@/lib/teamAccess";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawCode = body.code || body.passcode;

    if (!rawCode || typeof rawCode !== "string") {
      return NextResponse.json(
        { error: "Identification Code is required. Please check your team card." },
        { status: 400 }
      );
    }

    const member = lookupMemberByCode(rawCode);

    if (!member) {
      return NextResponse.json(
        { 
          error: "Invalid Identification Code. Verify the code on the back of your 3D Nexturn Team Card (e.g. NC-026-KS-2)." 
        },
        { status: 401 }
      );
    }

    const session: AuthSession = {
      user: member.name,
      code: member.code,
      role: member.role,
      accessLevel: member.accessLevel,
      department: member.department,
      permissions: ACCESS_LEVEL_PERMISSIONS[member.accessLevel],
      issuedAt: Date.now(),
    };

    const token = createToken(session);
    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      session,
      message: `Authenticated as ${member.name} (${member.accessLevel === "ALPHA_1" ? "Alpha-1 Leaders/Tech" : "Beta-2 Core Member"})`,
    });
  } catch (err) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { error: "Internal authentication error" },
      { status: 500 }
    );
  }
}

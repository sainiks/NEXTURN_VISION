import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendTestEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendTestEmail();
  return NextResponse.json(result);
}

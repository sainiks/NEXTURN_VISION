import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getActivityLogs, deleteActivityLog, clearAllActivityLogs } from "@/lib/mailer";
import { isVicePresident } from "@/lib/teamAccess";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Strictly enforce that VP Audit Logs are ONLY visible to Kunal Saini
  if (!isVicePresident(session)) {
    return NextResponse.json(
      { error: "Access Denied: VP Security Audit Logs are confidential and strictly restricted to Vice President Kunal Saini." },
      { status: 403 }
    );
  }

  const logs = await getActivityLogs();
  return NextResponse.json({
    success: true,
    logs,
    isVicePresident: true,
  });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Strictly enforce Vice-President permission
  if (!isVicePresident(session)) {
    return NextResponse.json(
      { error: "Access Denied: Only the Vice President (Kunal Saini) has clearance to delete security audit logs." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    // Clear all logs
    if (body.all === true) {
      const result = await clearAllActivityLogs();
      if (!result.success) {
        return NextResponse.json({ error: result.error || "Failed to clear logs" }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        message: "All audit logs have been successfully cleared by the Vice President.",
      });
    }

    // Delete single log by id
    if (!body.id || typeof body.id !== "string") {
      return NextResponse.json({ error: "Log ID is required for deletion." }, { status: 400 });
    }

    const result = await deleteActivityLog(body.id);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Log entry not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Log entry ${body.id} was permanently deleted by the Vice President.`,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}

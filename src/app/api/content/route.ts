import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getPortalData,
  savePortalData,
  Drive,
  RecruiterStep,
  PipelineEvent,
  TopTalent,
} from "@/lib/content";
import { logAndNotifyAlpha1Change } from "@/lib/mailer";
import { commitPortalDataToGitHub } from "@/lib/githubSync";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getPortalData();
  return NextResponse.json({ success: true, data });
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required. Please enter your Nexturn Identification Code." },
        { status: 401 }
      );
    }

    // Enforce Alpha-1 access level for any changes
    if (session.accessLevel !== "ALPHA_1") {
      return NextResponse.json(
        { 
          error: `Access Denied: You are authenticated with ${session.accessLevel || "BETA_2"} clearance. Core members have read-only access and cannot modify site data. Alpha-1 clearance (Leaders & Tech Team) is required.` 
        },
        { status: 403 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request payload provided" }, { status: 400 });
    }

    const { section, payload } = body || {};

    if (!section || typeof section !== "string") {
      return NextResponse.json({ error: "Section parameter is required" }, { status: 400 });
    }

    if (!Array.isArray(payload)) {
      return NextResponse.json({ error: `Payload for section '${section}' must be an array of entries` }, { status: 400 });
    }

    const currentData = await getPortalData();
    let changeSummary = "";

    if (section === "pipelineEvents") {
      if (!session.permissions.includes("pipeline:write")) {
        return NextResponse.json({ error: "Missing pipeline:write permission" }, { status: 403 });
      }

      // Robust sanitization of all pipeline event items
      const sanitizedEvents: PipelineEvent[] = payload.map((raw: any, idx: number) => {
        const item = typeof raw === "object" && raw !== null ? raw : {};
        const idNum = Number(item.id);
        return {
          id: Number.isFinite(idNum) && idNum > 0 ? idNum : idx + 1,
          date: String(item.date || "OCT 30, 2026").trim(),
          status: String(item.status || "SCHEDULED").trim(),
          title: String(item.title || "New Campus Event").trim(),
          location: String(item.location || "IITM Main Auditorium").trim(),
          priority: String(item.priority || "High").trim(),
          formUrl: String(item.formUrl || "").trim(),
        };
      });

      currentData.pipelineEvents = sanitizedEvents;

      const eventSummaries = sanitizedEvents.map(
        (e) => `• Event #${e.id}: "${e.title}" (${e.date}) [Status: ${e.status}, Priority: ${e.priority}, Loc: ${e.location}]\n   └─ Google Form RSVP Link: ${e.formUrl || "Not Attached"}`
      ).join("\n");

      changeSummary = `Updated Mission Pipeline Events to ${sanitizedEvents.length} events with Google Form links:\n${eventSummaries}`;
    } else if (section === "drives") {
      if (!session.permissions.includes("drives:write")) {
        return NextResponse.json({ error: "Missing drives:write permission" }, { status: 403 });
      }

      // Robust sanitization of all drive items
      const sanitizedDrives: Drive[] = payload.map((raw: any, idx: number) => {
        const item = typeof raw === "object" && raw !== null ? raw : {};
        const idNum = Number(item.id);
        const validStatus: Drive["status"] = ["OPEN", "CLOSED", "UPCOMING"].includes(item.status)
          ? item.status
          : "OPEN";
        return {
          id: Number.isFinite(idNum) && idNum > 0 ? idNum : idx + 1,
          role: String(item.role || "Software Development Engineer").trim(),
          company: String(item.company || "New Company").trim(),
          ctc: String(item.ctc || "12 LPA").trim(),
          deadline: String(item.deadline || "TBD").trim(),
          portalUrl: String(item.portalUrl || "").trim(),
          status: validStatus,
        };
      });

      currentData.drives = sanitizedDrives;

      const driveSummaries = sanitizedDrives.map(
        (d) => `• ${d.company} - ${d.role} (${d.ctc}) [Deadline: ${d.deadline}, Status: ${d.status}] -> Portal URL: ${d.portalUrl || "None"}`
      ).join("\n");

      changeSummary = `Updated Student Active Drives list to ${sanitizedDrives.length} entries:\n${driveSummaries}`;
    } else if (section === "recruiterProcess") {
      if (!session.permissions.includes("process:write")) {
        return NextResponse.json({ error: "Missing process:write permission" }, { status: 403 });
      }

      // Robust sanitization of all recruiter step items
      const sanitizedProcess: RecruiterStep[] = payload.map((raw: any, idx: number) => {
        const item = typeof raw === "object" && raw !== null ? raw : {};
        return {
          phase: String(item.phase || String(idx + 1).padStart(2, "0")).trim(),
          title: String(item.title || `Stage ${idx + 1}`).trim(),
          desc: String(item.desc || "").trim(),
        };
      });

      currentData.recruiterProcess = sanitizedProcess;

      const processSummaries = sanitizedProcess.map(
        (p) => `• Phase ${p.phase}: "${p.title}" - ${p.desc}`
      ).join("\n");

      changeSummary = `Updated Recruiter Process stages to ${sanitizedProcess.length} phases:\n${processSummaries}`;
    } else if (section === "topTalents") {
      if (!session.permissions.includes("talents:write")) {
        return NextResponse.json({ error: "Missing talents:write permission" }, { status: 403 });
      }

      // Robust sanitization of top talents items
      const sanitizedTalents: TopTalent[] = payload.map((raw: any, idx: number) => {
        const item = typeof raw === "object" && raw !== null ? raw : {};
        const idNum = Number(item.id);
        return {
          id: Number.isFinite(idNum) && idNum > 0 ? idNum : idx + 1,
          full_name: String(item.full_name || "").trim(),
          course: String(item.course || "").trim(),
          company: String(item.company || "").trim(),
          pic: String(item.pic || "").trim(),
          role: item.role ? String(item.role).trim() : undefined,
        };
      });

      currentData.topTalents = sanitizedTalents;

      const talentSummaries = sanitizedTalents.map(
        (t, idx) => {
          const picLabel = typeof t.pic === "string" && t.pic.startsWith("data:")
            ? "(Custom Uploaded Image)"
            : (t.pic || "Default Icon");
          return `• Talent #${idx + 1}: ${t.full_name || "Unnamed"} | Course: ${t.course || "N/A"} | Company: ${t.company || "N/A"} | Photo: ${picLabel}`;
        }
      ).join("\n");

      changeSummary = `Updated Home Page Top 4 Talents showcase:\n${talentSummaries}`;
    } else {
      return NextResponse.json({ error: `Invalid section type: '${section}'` }, { status: 400 });
    }

    // Persist to multi-tier storage
    await savePortalData(currentData);

    // Commit directly to GitHub master branch for permanent cloud persistence
    let githubSynced = false;
    let githubCommitSha: string | null = null;
    let githubNote = "";

    try {
      const githubResult = await commitPortalDataToGitHub(currentData, {
        name: session.user,
        code: session.code,
        role: session.role,
        section,
      });
      githubSynced = githubResult.success;
      githubCommitSha = githubResult.commitSha || null;

      if (githubResult.success) {
        githubNote = ` Committed to GitHub master (${githubResult.commitSha?.slice(0, 7)}).`;
      } else if (githubResult.skipped) {
        githubNote = ` (Cloud Notice: Set GITHUB_TOKEN in Vercel to auto-commit to GitHub).`;
      } else if (githubResult.error) {
        githubNote = ` (GitHub sync: ${githubResult.error}).`;
      }
    } catch (ghErr) {
      console.warn("[CONTENT API] Non-fatal GitHub sync error:", ghErr);
      githubNote = " (GitHub sync non-fatal warning).";
    }

    // Dispatches email to nexturn.kunal@gmail.com and records in audit log
    // Non-blocking & safely isolated so mailer issues cannot crash or fail data saving
    let mailStatus: "SENT" | "QUEUED_LOCAL" = "QUEUED_LOCAL";
    try {
      const mailResult = await logAndNotifyAlpha1Change({
        memberName: session.user,
        memberCode: session.code,
        memberRole: session.role,
        section,
        summary: changeSummary,
        details: payload,
      });
      mailStatus = mailResult.status;
    } catch (mailError) {
      console.warn("[CONTENT API] Non-fatal notification error:", mailError);
    }

    return NextResponse.json({
      success: true,
      data: currentData,
      mailStatus,
      githubSynced,
      githubCommit: githubCommitSha,
      message: `Section '${section}' updated successfully!${githubNote} Audit email logged for Vice President (nexturn.kunal@gmail.com).`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Failed to update content:", errorMsg, err);
    return NextResponse.json({ error: `Failed to persist content update: ${errorMsg}` }, { status: 500 });
  }
}

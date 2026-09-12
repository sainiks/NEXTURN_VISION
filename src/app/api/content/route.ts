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

    const body = await request.json();
    const { section, payload } = body;

    const currentData = await getPortalData();
    let changeSummary = "";

    if (section === "drives") {
      if (!session.permissions.includes("drives:write")) {
        return NextResponse.json({ error: "Missing drives:write permission" }, { status: 403 });
      }
      const newDrives = payload as Drive[];
      currentData.drives = newDrives;

      const driveSummaries = newDrives.map(
        (d) => `• ${d.company} - ${d.role} (${d.ctc}) [Deadline: ${d.deadline}, Status: ${d.status}] -> Portal URL: ${d.portalUrl || "None"}`
      ).join("\n");

      changeSummary = `Updated Student Active Drives list to ${newDrives.length} entries:\n${driveSummaries}`;
    } else if (section === "recruiterProcess") {
      if (!session.permissions.includes("process:write")) {
        return NextResponse.json({ error: "Missing process:write permission" }, { status: 403 });
      }
      const newProcess = payload as RecruiterStep[];
      currentData.recruiterProcess = newProcess;

      const processSummaries = newProcess.map(
        (p) => `• Phase ${p.phase}: "${p.title}" - ${p.desc}`
      ).join("\n");

      changeSummary = `Updated Recruiter Process stages to ${newProcess.length} phases:\n${processSummaries}`;
    } else if (section === "pipelineEvents") {
      if (!session.permissions.includes("pipeline:write")) {
        return NextResponse.json({ error: "Missing pipeline:write permission" }, { status: 403 });
      }
      const newEvents = payload as PipelineEvent[];
      currentData.pipelineEvents = newEvents;

      const eventSummaries = newEvents.map(
        (e) => `• Event #${e.id}: "${e.title}" (${e.date}) [Status: ${e.status}, Priority: ${e.priority}, Loc: ${e.location}]\n   └─ Google Form RSVP Link: ${e.formUrl || "Not Attached"}`
      ).join("\n");

      changeSummary = `Updated Mission Pipeline Events to ${newEvents.length} events with Google Form links:\n${eventSummaries}`;
    } else if (section === "topTalents") {
      if (!session.permissions.includes("talents:write")) {
        return NextResponse.json({ error: "Missing talents:write permission" }, { status: 403 });
      }
      const newTalents = payload as TopTalent[];
      currentData.topTalents = newTalents;

      const talentSummaries = newTalents.map(
        (t, idx) => `• Talent #${idx + 1}: ${t.full_name || "Unnamed"} | Course: ${t.course || "N/A"} | Company: ${t.company || "N/A"} | Photo: ${t.pic ? (t.pic.startsWith("data:") ? "(Custom Uploaded Image)" : t.pic) : "Default Icon"}`
      ).join("\n");

      changeSummary = `Updated Home Page Top 4 Talents showcase:\n${talentSummaries}`;
    } else {
      return NextResponse.json({ error: "Invalid section type" }, { status: 400 });
    }

    await savePortalData(currentData);

    // Dispatches email to nexturn.kunal@gmail.com and records in audit log
    const mailResult = await logAndNotifyAlpha1Change({
      memberName: session.user,
      memberCode: session.code,
      memberRole: session.role,
      section,
      summary: changeSummary,
      details: payload,
    });

    return NextResponse.json({
      success: true,
      data: currentData,
      mailStatus: mailResult.status,
      message: `Section '${section}' updated successfully. Audit email logged for Vice President (nexturn.kunal@gmail.com).`,
    });
  } catch (err) {
    console.error("Failed to update content:", err);
    return NextResponse.json({ error: "Failed to persist content update" }, { status: 500 });
  }
}

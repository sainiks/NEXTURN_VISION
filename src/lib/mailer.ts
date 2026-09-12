import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";

const NOTIFICATION_RECIPIENT = "nexturn.kunal@gmail.com";
const ACTIVITY_LOGS_PATH = path.join(process.cwd(), "src", "data", "activityLogs.json");

export interface ActivityLogEntry {
  id: string;
  createdAt: number;
  timestamp: string;
  actor: {
    name: string;
    code: string;
    role: string;
    accessLevel: "ALPHA_1";
  };
  section: "drives" | "recruiterProcess" | "pipelineEvents" | string;
  summary: string;
  details: unknown;
  recipient: string;
  emailStatus: "SENT" | "QUEUED_LOCAL";
  error?: string;
}

export const LOG_RETENTION_DAYS = 30;
export const LOG_RETENTION_MS = LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export function getLogTimestamp(log: Partial<ActivityLogEntry>): number {
  if (typeof log.createdAt === "number" && !isNaN(log.createdAt) && log.createdAt > 0) {
    return log.createdAt;
  }
  if (log.id) {
    const match = log.id.match(/^LOG-(\d+)-/);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  if (log.timestamp) {
    const cleaned = log.timestamp.replace(" IST", "");
    const dateParsed = Date.parse(cleaned);
    if (!isNaN(dateParsed)) return dateParsed;
  }
  return Date.now();
}

export function filterExpiredLogs(logs: ActivityLogEntry[], now = Date.now()): ActivityLogEntry[] {
  return logs.filter((log) => {
    const logTime = getLogTimestamp(log);
    const ageMs = now - logTime;
    return ageMs <= LOG_RETENTION_MS;
  });
}

export async function logAndNotifyAlpha1Change(params: {
  memberName: string;
  memberCode: string;
  memberRole: string;
  section: string;
  summary: string;
  details?: unknown;
}): Promise<{ success: boolean; status: "SENT" | "QUEUED_LOCAL"; error?: string }> {
  const nowMs = Date.now();
  const timestamp = new Date(nowMs).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST";
  const logId = `LOG-${nowMs}-${Math.floor(Math.random() * 1000)}`;

  const sectionTitles: Record<string, string> = {
    drives: "STUDENT PORTAL // ACTIVE DRIVES & PORTAL LINKS",
    recruiterProcess: "RECRUITER SECTION // THE PROCESS",
    pipelineEvents: "PIPELINE TIMELINE // EVENTS & GOOGLE FORMS",
    topTalents: "HOME PAGE // TOP 4 TALENTS SHOWCASE",
  };

  const formattedSection = sectionTitles[params.section] || params.section.toUpperCase();

  const emailSubject = `[NEXTURN AUDIT] Alpha-1 Activity: ${params.memberName} modified ${formattedSection}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; color: #18181b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 3px solid #18181b; box-shadow: 6px 6px 0px #d90429; padding: 32px; }
        .badge { display: inline-block; background-color: #d90429; color: #ffffff; font-size: 11px; font-weight: 900; text-transform: uppercase; padding: 4px 10px; letter-spacing: 1.5px; }
        h1 { font-size: 22px; font-weight: 900; text-transform: uppercase; margin: 16px 0 8px 0; letter-spacing: -0.5px; }
        .meta-box { background-color: #f8fafc; border: 2px solid #e2e8f0; padding: 16px; margin: 20px 0; }
        .meta-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; font-family: monospace; }
        .meta-row:last-child { margin-bottom: 0; }
        .label { font-weight: bold; color: #64748b; }
        .value { font-weight: 900; color: #0f172a; }
        .changes-box { background: #fff1f2; border-left: 4px solid #d90429; padding: 16px; margin: 20px 0; font-size: 14px; line-height: 1.6; }
        .footer { font-size: 11px; color: #71717a; border-top: 1px solid #e4e4e7; margin-top: 24px; padding-top: 16px; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">SECURITY AUDIT // ALPHA-1 ACTIVITY</span>
        <h1>Nexturn Portal Data Modified</h1>
        <p style="font-size: 14px; color: #52525b; margin-top: 4px;">
          An authenticated member with <strong>Alpha-1 Clearance</strong> has updated production portal content.
        </p>

        <div class="meta-box">
          <div class="meta-row"><span class="label">ACTOR:</span><span class="value">${params.memberName} (${params.memberRole})</span></div>
          <div class="meta-row"><span class="label">ID CODE:</span><span class="value">${params.memberCode}</span></div>
          <div class="meta-row"><span class="label">SECTION:</span><span class="value">${formattedSection}</span></div>
          <div class="meta-row"><span class="label">TIMESTAMP:</span><span class="value">${timestamp}</span></div>
          <div class="meta-row"><span class="label">RECIPIENT:</span><span class="value">${NOTIFICATION_RECIPIENT}</span></div>
        </div>

        <h3 style="font-size: 13px; text-transform: uppercase; font-family: monospace; margin-bottom: 8px;">Activity Description:</h3>
        <div class="changes-box">
          ${params.summary.replace(/\n/g, "<br>")}
        </div>

        <div class="footer">
          This is an automated operational notification dispatched to Vice President Kunal Saini (<a href="mailto:${NOTIFICATION_RECIPIENT}">${NOTIFICATION_RECIPIENT}</a>).<br>
          Nexturn Connect // Academic Year 2026-27.
        </div>
      </div>
    </body>
    </html>
  `;

  let emailStatus: "SENT" | "QUEUED_LOCAL" = "QUEUED_LOCAL";
  let dispatchError: string | undefined;

  // Check if SMTP is configured
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || "465", 10),
        secure: true,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Nexturn Security Monitor" <${smtpUser}>`,
        to: NOTIFICATION_RECIPIENT,
        subject: emailSubject,
        html: emailHtml,
      });

      emailStatus = "SENT";
      console.log(`[MAILER] Notification successfully sent to ${NOTIFICATION_RECIPIENT}`);
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("535") || msg.includes("BadCredentials") || msg.includes("Username and Password not accepted")) {
        msg = "Google rejected credentials (535 BadCredentials): Google requires a 16-character Google App Password (https://myaccount.google.com/apppasswords), not your standard account password.";
      }
      console.error(`[MAILER] Failed to send live email to ${NOTIFICATION_RECIPIENT}:`, msg);
      emailStatus = "QUEUED_LOCAL";
      dispatchError = msg;
    }
  } else {
    // Log to console and local queue if SMTP is not yet set
    console.log(`[MAILER AUDIT] Alpha-1 Activity Recorded for ${NOTIFICATION_RECIPIENT}:`);
    console.log(`- By: ${params.memberName} (${params.memberCode})`);
    console.log(`- Section: ${formattedSection}`);
    console.log(`- Summary: ${params.summary}`);
    dispatchError = "SMTP credentials missing in .env.local. Set GMAIL_USER and GMAIL_APP_PASSWORD.";
  }

  // Persist to activityLogs.json
  const logEntry: ActivityLogEntry = {
    id: logId,
    createdAt: nowMs,
    timestamp,
    actor: {
      name: params.memberName,
      code: params.memberCode,
      role: params.memberRole,
      accessLevel: "ALPHA_1",
    },
    section: params.section,
    summary: params.summary,
    details: params.details || null,
    recipient: NOTIFICATION_RECIPIENT,
    emailStatus,
    error: dispatchError,
  };

  try {
    let existingLogs: ActivityLogEntry[] = [];
    try {
      const raw = await fs.readFile(ACTIVITY_LOGS_PATH, "utf-8");
      existingLogs = JSON.parse(raw);
    } catch {
      existingLogs = [];
    }

    // Auto-prune logs older than 30 days
    existingLogs = filterExpiredLogs(existingLogs, nowMs);

    existingLogs.unshift(logEntry);
    // Keep max 200 entries
    if (existingLogs.length > 200) existingLogs = existingLogs.slice(0, 200);

    await fs.writeFile(ACTIVITY_LOGS_PATH, JSON.stringify(existingLogs, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save activity log:", err);
  }

  return { success: true, status: emailStatus, error: dispatchError };
}

export async function getActivityLogs(): Promise<ActivityLogEntry[]> {
  try {
    const raw = await fs.readFile(ACTIVITY_LOGS_PATH, "utf-8");
    const logs: ActivityLogEntry[] = JSON.parse(raw);
    const now = Date.now();
    
    // Auto-purge any logs older than 30 days
    const activeLogs = filterExpiredLogs(logs, now);

    // If any logs have been pruned, persist cleaned list
    if (activeLogs.length !== logs.length) {
      await fs.writeFile(ACTIVITY_LOGS_PATH, JSON.stringify(activeLogs, null, 2), "utf-8");
      console.log(`[MAILER] Auto-deleted ${logs.length - activeLogs.length} expired logs older than 30 days.`);
    }

    return activeLogs;
  } catch {
    return [];
  }
}

export async function deleteActivityLog(logId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const raw = await fs.readFile(ACTIVITY_LOGS_PATH, "utf-8");
    let logs: ActivityLogEntry[] = JSON.parse(raw);
    const initialLen = logs.length;
    logs = logs.filter((l) => l.id !== logId);
    
    if (logs.length === initialLen) {
      return { success: false, error: "Log entry not found" };
    }

    await fs.writeFile(ACTIVITY_LOGS_PATH, JSON.stringify(logs, null, 2), "utf-8");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export async function clearAllActivityLogs(): Promise<{ success: boolean; error?: string }> {
  try {
    await fs.writeFile(ACTIVITY_LOGS_PATH, JSON.stringify([], null, 2), "utf-8");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export async function sendTestEmail(): Promise<{ success: boolean; message: string }> {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!smtpUser || !smtpPass) {
    return {
      success: false,
      message: "Credentials missing. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local to activate live inbox delivery.",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || "465", 10),
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"Nexturn Security Monitor" <${smtpUser}>`,
      to: NOTIFICATION_RECIPIENT,
      subject: `[TEST] Nexturn Security Notification System Connected`,
      html: `
        <div style="font-family: -apple-system, sans-serif; padding: 24px; border: 3px solid #18181b; max-width: 550px; background: #ffffff;">
          <h2 style="text-transform: uppercase; margin-top: 0; color: #d90429;">Nexturn Email Alert Active</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #333;">
            Hello Kunal,<br><br>
            This confirms that your live email notifications for <strong>${NOTIFICATION_RECIPIENT}</strong> are now fully connected.
          </p>
          <div style="background: #f4f4f5; padding: 14px; font-family: monospace; font-size: 12px; border-left: 3px solid #d90429; margin: 16px 0;">
            Any time an Alpha-1 member (Leadership or Tech Team) saves modifications to Active Drives, Recruiter Process, or Pipeline Events, a detailed change report will land in this inbox instantly.
          </div>
          <p style="font-size: 12px; color: #666; margin-bottom: 0;">IITM • Nexturn Connect Security</p>
        </div>
      `,
    });

    return {
      success: true,
      message: `Test email dispatched to ${NOTIFICATION_RECIPIENT}! Check your inbox.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("535") || msg.includes("BadCredentials") || msg.includes("Username and Password not accepted")) {
      return {
        success: false,
        message: "Google rejected the password (535 BadCredentials). Google requires a 16-character Google App Password (not your personal account password). Generate one at https://myaccount.google.com/apppasswords and set GMAIL_APP_PASSWORD in .env.local.",
      };
    }
    return {
      success: false,
      message: `Failed to send email: ${msg}`,
    };
  }
}

import fs from "fs/promises";
import path from "path";
import os from "os";

export interface Drive {
  id: number;
  role: string;
  company: string;
  ctc: string;
  deadline: string;
  portalUrl: string;
  status: "OPEN" | "CLOSED" | "UPCOMING";
}

export interface RecruiterStep {
  phase: string;
  title: string;
  desc: string;
}

export interface PipelineEvent {
  id: number;
  date: string;
  status: string;
  title: string;
  location: string;
  priority: string;
  formUrl: string;
}

export interface TopTalent {
  id: number;
  full_name: string;
  course: string;
  company: string;
  pic: string;
  role?: string;
}

export interface PortalData {
  drives: Drive[];
  recruiterProcess: RecruiterStep[];
  pipelineEvents: PipelineEvent[];
  topTalents: TopTalent[];
}

export const DEFAULT_PORTAL_DATA: PortalData = {
  drives: [
    {
      id: 1,
      role: "Frontend Engineer",
      company: "ZOMATO",
      ctc: "24 LPA",
      deadline: "12 OCT",
      portalUrl: "https://www.zomato.com/careers",
      status: "OPEN",
    },
    {
      id: 2,
      role: "Backend Developer",
      company: "ATLASSIAN",
      ctc: "45 LPA",
      deadline: "15 OCT",
      portalUrl: "https://www.atlassian.com/company/careers",
      status: "OPEN",
    },
    {
      id: 3,
      role: "Data Scientist",
      company: "UBER",
      ctc: "36 LPA",
      deadline: "20 OCT",
      portalUrl: "https://www.uber.com/us/en/careers/",
      status: "OPEN",
    },
    {
      id: 4,
      role: "Quantitative Analyst",
      company: "DE SHAW",
      ctc: "60 LPA",
      deadline: "22 OCT",
      portalUrl: "https://www.deshaw.com/careers",
      status: "OPEN",
    },
  ],
  recruiterProcess: [
    {
      phase: "01",
      title: "Pre-Placement TAlk",
      desc: "Introduce your culture and roles to the student body.",
    },
    {
      phase: "02",
      title: "Assessments",
      desc: "Conduct online coding rounds, aptitude tests, or design challenges.",
    },
    {
      phase: "03",
      title: "Interviews",
      desc: "Technical, HR, and culture-fit rounds facilitated seamlessly.",
    },
    {
      phase: "04",
      title: "Offers",
      desc: "Roll out final offers and begin the onboarding process.",
    },
  ],
  pipelineEvents: [
    {
      id: 4,
      date: "MAY 02, 2026",
      status: "SCHEDULED",
      title: "NEXTera 1.0 - Internship Drive",
      location: "IITM Campus",
      priority: "High",
      formUrl: "https://forms.google.com/",
    },
    {
      id: 3,
      date: "NOV 24, 2025",
      status: "CLOSED",
      title: "Blood Bank Camp",
      location: "IITM Reception area",
      priority: "High",
      formUrl: "https://forms.google.com/",
    },
    {
      id: 2,
      date: "OCT 15, 2025",
      status: "CLOSED",
      title: "FUSION - X",
      location: "BASE 2",
      priority: "High",
      formUrl: "https://forms.google.com/",
    },
    {
      id: 1,
      date: "JAN 30, 2025",
      status: "CLOSED",
      title: "IGNISIA - The Intern Fair",
      location: "Hall A",
      priority: "High",
      formUrl: "https://forms.google.com/",
    },
  ],
  topTalents: [
    { id: 1, full_name: "Aarav Sharma", course: "B.Tech CSE 2026", company: "GOOGLE", pic: "", role: "Software Engineer" },
    { id: 2, full_name: "Diya Patel", course: "BCA 2026", company: "MICROSOFT", pic: "", role: "Full Stack Developer" },
    { id: 3, full_name: "Rohan Verma", course: "B.Tech IT 2026", company: "ZOMATO", pic: "", role: "Data Systems Engineer" },
    { id: 4, full_name: "Ananya Iyer", course: "B.Tech CSE 2026", company: "ATLASSIAN", pic: "", role: "AI / ML Researcher" },
  ],
};

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "portalData.json");
const FALLBACK_DATA_FILE_PATH = path.join(os.tmpdir(), "nexturn_portalData.json");

declare global {
  // eslint-disable-next-line no-var
  var __nexturn_portal_data_cache__: PortalData | undefined;
}

function sanitizePortalData(input: unknown): PortalData {
  const parsed = (typeof input === "object" && input !== null ? input : {}) as Partial<PortalData>;

  const drives: Drive[] = Array.isArray(parsed.drives)
    ? parsed.drives.map((d: any, idx: number) => ({
        id: Number(d?.id) || idx + 1,
        role: String(d?.role || "Software Engineer"),
        company: String(d?.company || "Company"),
        ctc: String(d?.ctc || "12 LPA"),
        deadline: String(d?.deadline || "TBD"),
        portalUrl: String(d?.portalUrl || ""),
        status: (["OPEN", "CLOSED", "UPCOMING"].includes(d?.status) ? d.status : "OPEN") as Drive["status"],
      }))
    : DEFAULT_PORTAL_DATA.drives;

  const recruiterProcess: RecruiterStep[] = Array.isArray(parsed.recruiterProcess)
    ? parsed.recruiterProcess.map((p: any, idx: number) => ({
        phase: String(p?.phase || String(idx + 1).padStart(2, "0")),
        title: String(p?.title || `Stage ${idx + 1}`),
        desc: String(p?.desc || ""),
      }))
    : DEFAULT_PORTAL_DATA.recruiterProcess;

  const pipelineEvents: PipelineEvent[] = Array.isArray(parsed.pipelineEvents)
    ? parsed.pipelineEvents.map((e: any, idx: number) => ({
        id: Number(e?.id) || idx + 1,
        date: String(e?.date || "OCT 30, 2026"),
        status: String(e?.status || "SCHEDULED"),
        title: String(e?.title || "New Campus Event"),
        location: String(e?.location || "IITM Campus"),
        priority: String(e?.priority || "High"),
        formUrl: String(e?.formUrl || ""),
      }))
    : DEFAULT_PORTAL_DATA.pipelineEvents;

  const topTalents: TopTalent[] = Array.isArray(parsed.topTalents) && parsed.topTalents.length > 0
    ? parsed.topTalents.map((t: any, idx: number) => ({
        id: Number(t?.id) || idx + 1,
        full_name: String(t?.full_name || ""),
        course: String(t?.course || ""),
        company: String(t?.company || ""),
        pic: String(t?.pic || ""),
        role: t?.role ? String(t.role) : undefined,
      }))
    : DEFAULT_PORTAL_DATA.topTalents;

  return {
    drives,
    recruiterProcess,
    pipelineEvents,
    topTalents,
  };
}

export async function getPortalData(): Promise<PortalData> {
  // If in-memory cache is present and loaded, return a clean clone
  if (globalThis.__nexturn_portal_data_cache__) {
    return JSON.parse(JSON.stringify(globalThis.__nexturn_portal_data_cache__));
  }

  // Attempt reading from primary disk location
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const sanitized = sanitizePortalData(JSON.parse(raw));
    globalThis.__nexturn_portal_data_cache__ = sanitized;
    return JSON.parse(JSON.stringify(sanitized));
  } catch (primaryErr) {
    // Attempt reading from fallback /tmp location
    try {
      const rawFallback = await fs.readFile(FALLBACK_DATA_FILE_PATH, "utf-8");
      const sanitizedFallback = sanitizePortalData(JSON.parse(rawFallback));
      globalThis.__nexturn_portal_data_cache__ = sanitizedFallback;
      return JSON.parse(JSON.stringify(sanitizedFallback));
    } catch {
      console.warn("[PORTAL DATA] No existing storage file found. Initializing with defaults.");
      const defaults = JSON.parse(JSON.stringify(DEFAULT_PORTAL_DATA));
      globalThis.__nexturn_portal_data_cache__ = defaults;
      // Proactively try saving defaults
      try {
        await savePortalData(defaults);
      } catch {
        // Non-blocking
      }
      return defaults;
    }
  }
}

export async function savePortalData(data: PortalData): Promise<void> {
  const sanitized = sanitizePortalData(data);
  // Update in-memory cache first so all active server processes are instantly updated
  globalThis.__nexturn_portal_data_cache__ = sanitized;

  const jsonStr = JSON.stringify(sanitized, null, 2);
  let savedToDisk = false;
  let diskError: unknown;

  // 1. Try writing to primary storage location with directory creation
  try {
    await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
    // Write atomically via temporary file
    const tmpFile = `${DATA_FILE_PATH}.${Date.now()}.tmp`;
    await fs.writeFile(tmpFile, jsonStr, "utf-8");
    try {
      await fs.rename(tmpFile, DATA_FILE_PATH);
    } catch {
      // Direct write fallback
      await fs.writeFile(DATA_FILE_PATH, jsonStr, "utf-8");
      try {
        await fs.unlink(tmpFile);
      } catch {
        // ignore
      }
    }
    savedToDisk = true;
  } catch (err) {
    diskError = err;
    console.warn(`[PORTAL DATA] Primary write to ${DATA_FILE_PATH} failed (${(err as Error)?.message}). Trying fallback tmp storage...`);
  }

  // 2. Try writing to fallback location (e.g. for serverless / read-only filesystems)
  try {
    await fs.writeFile(FALLBACK_DATA_FILE_PATH, jsonStr, "utf-8");
    savedToDisk = true;
  } catch (fallbackErr) {
    if (!savedToDisk) {
      console.warn(`[PORTAL DATA] Fallback write to ${FALLBACK_DATA_FILE_PATH} failed (${(fallbackErr as Error)?.message}). Data retained in memory.`);
    }
  }

  // If in-memory cache was updated, persistence is satisfied in-memory even if OS filesystem is totally locked.
  // Only throw if both memory and disk could not be updated (which won't happen here).
}

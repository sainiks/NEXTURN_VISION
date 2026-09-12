import fs from "fs/promises";
import path from "path";

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

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "portalData.json");

export async function getPortalData(): Promise<PortalData> {
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as PortalData;
    if (!parsed.topTalents || parsed.topTalents.length === 0) {
      parsed.topTalents = [
        { id: 1, full_name: "Aarav Sharma", course: "B.Tech CSE 2026", company: "GOOGLE", pic: "", role: "Software Engineer" },
        { id: 2, full_name: "Diya Patel", course: "BCA 2026", company: "MICROSOFT", pic: "", role: "Full Stack Developer" },
        { id: 3, full_name: "Rohan Verma", course: "B.Tech IT 2026", company: "ZOMATO", pic: "", role: "Data Systems Engineer" },
        { id: 4, full_name: "Ananya Iyer", course: "B.Tech CSE 2026", company: "ATLASSIAN", pic: "", role: "AI / ML Researcher" },
      ];
    }
    return parsed;
  } catch (err) {
    console.error("Error reading portalData.json, fallback to defaults", err);
    return {
      drives: [],
      recruiterProcess: [],
      pipelineEvents: [],
      topTalents: [
        { id: 1, full_name: "Aarav Sharma", course: "B.Tech CSE 2026", company: "GOOGLE", pic: "", role: "Software Engineer" },
        { id: 2, full_name: "Diya Patel", course: "BCA 2026", company: "MICROSOFT", pic: "", role: "Full Stack Developer" },
        { id: 3, full_name: "Rohan Verma", course: "B.Tech IT 2026", company: "ZOMATO", pic: "", role: "Data Systems Engineer" },
        { id: 4, full_name: "Ananya Iyer", course: "B.Tech CSE 2026", company: "ATLASSIAN", pic: "", role: "AI / ML Researcher" },
      ],
    };
  }
}

export async function savePortalData(data: PortalData): Promise<void> {
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

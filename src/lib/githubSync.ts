import { PortalData } from "./content";
import { ActivityLogEntry } from "./mailer";

interface GitHubRepoConfig {
  owner: string;
  repo: string;
  branch: string;
}

export function getGitHubConfig(): GitHubRepoConfig {
  const fullRepo = process.env.GITHUB_REPO || "sainiks/NEXTURN_VISION";
  const [owner, repo] = fullRepo.split("/");
  const branch = process.env.GITHUB_BRANCH || "master";
  return {
    owner: owner || "sainiks",
    repo: repo || "NEXTURN_VISION",
    branch: branch || "master",
  };
}

export function getGitHubToken(): string | null {
  const envToken = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT || process.env.GH_TOKEN;
  if (envToken && envToken.trim().length > 0) {
    return envToken.trim();
  }

  // Local fallback: Check if gh CLI is available on local machine
  if (process.env.NODE_ENV !== "production") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { execSync } = require("child_process");
      const token = execSync("gh auth token", { encoding: "utf-8", timeout: 2000 }).trim();
      if (token) return token;
    } catch {
      // gh cli not available or not logged in
    }
  }

  return null;
}

export async function commitPortalDataToGitHub(
  data: PortalData,
  actor?: { name: string; code: string; role: string; section?: string }
): Promise<{ success: boolean; commitSha?: string; error?: string; skipped?: boolean }> {
  const token = getGitHubToken();
  const config = getGitHubConfig();

  if (!token) {
    console.warn("[GITHUB SYNC] No GITHUB_TOKEN configured. Local/tmp persistence active, but GitHub auto-commit was skipped.");
    return {
      success: false,
      skipped: true,
      error: "GITHUB_TOKEN missing. Set GITHUB_TOKEN in your Vercel/environment variables to auto-commit changes to GitHub.",
    };
  }

  const filePath = "src/data/portalData.json";
  const contentUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}`;

  try {
    // 1. Fetch current file SHA from GitHub
    const getRes = await fetch(contentUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Nexturn-Connect-Core",
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    });

    let currentSha: string | undefined;
    if (getRes.ok) {
      const fileMeta = await getRes.json();
      currentSha = fileMeta.sha;
    }

    // 2. Prepare JSON payload and Base64 content
    const jsonString = JSON.stringify(data, null, 2);
    const base64Content = Buffer.from(jsonString, "utf-8").toString("base64");

    const actorName = actor?.name || "Alpha-1 Member";
    const sectionName = actor?.section ? ` [${actor.section}]` : "";
    const commitMessage = `chore(portal): update portal content via Core Admin${sectionName} [by ${actorName}]`;

    // 3. Commit to GitHub master branch
    const putRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Nexturn-Connect-Core",
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        sha: currentSha,
        branch: config.branch,
        committer: {
          name: actor?.name || "Nexturn System Bot",
          email: "nexturn.kunal@gmail.com",
        },
      }),
    });

    if (!putRes.ok) {
      const errBody = await putRes.text();
      console.error(`[GITHUB SYNC] GitHub API returned HTTP ${putRes.status}:`, errBody);
      return {
        success: false,
        error: `GitHub API error (${putRes.status}): ${errBody}`,
      };
    }

    const putData = await putRes.json();
    const commitSha = putData.commit?.sha;
    console.log(`[GITHUB SYNC] Successfully committed portalData.json to GitHub (${config.branch}) at commit ${commitSha}`);

    return {
      success: true,
      commitSha,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[GITHUB SYNC] Network error communicating with GitHub API:", msg);
    return {
      success: false,
      error: `GitHub sync network error: ${msg}`,
    };
  }
}

export async function commitActivityLogsToGitHub(
  logs: ActivityLogEntry[],
  actorName?: string
): Promise<{ success: boolean; commitSha?: string; error?: string; skipped?: boolean }> {
  const token = getGitHubToken();
  const config = getGitHubConfig();

  if (!token) return { success: false, skipped: true, error: "GITHUB_TOKEN missing" };

  const filePath = "src/data/activityLogs.json";
  const contentUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}`;

  try {
    const getRes = await fetch(contentUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Nexturn-Connect-Core",
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    });

    let currentSha: string | undefined;
    if (getRes.ok) {
      const fileMeta = await getRes.json();
      currentSha = fileMeta.sha;
    }

    const jsonString = JSON.stringify(logs, null, 2);
    const base64Content = Buffer.from(jsonString, "utf-8").toString("base64");

    const putRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Nexturn-Connect-Core",
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `chore(audit): update security activity logs [by ${actorName || "Alpha-1"}]`,
        content: base64Content,
        sha: currentSha,
        branch: config.branch,
        committer: {
          name: "Nexturn System Bot",
          email: "nexturn.kunal@gmail.com",
        },
      }),
    });

    if (!putRes.ok) {
      return { success: false, error: `GitHub API error: ${putRes.status}` };
    }

    const putData = await putRes.json();
    return { success: true, commitSha: putData.commit?.sha };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function fetchPortalDataFromGitHub(): Promise<PortalData | null> {
  const config = getGitHubConfig();
  const rawUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/src/data/portalData.json`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const token = getGitHubToken();
    const headers: Record<string, string> = {
      "User-Agent": "Nexturn-Connect-Core",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(rawUrl, {
      headers,
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const parsed = await res.json();
      return parsed as PortalData;
    }
    return null;
  } catch (err) {
    console.warn("[GITHUB SYNC] Could not fetch remote portal data from GitHub, using local cache:", (err as Error)?.message);
    return null;
  }
}

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

async function commitFileToGitHub(
  filePath: string,
  contentBase64: string,
  commitMessage: string,
  actorName: string = "Nexturn System Bot"
): Promise<{ success: boolean; commitSha?: string; error?: string; skipped?: boolean }> {
  const token = getGitHubToken();
  const config = getGitHubConfig();

  if (!token) {
    console.warn(`[GITHUB SYNC] No GITHUB_TOKEN configured. GitHub auto-commit for ${filePath} was skipped.`);
    return {
      success: false,
      skipped: true,
      error: "GITHUB_TOKEN missing. Set GITHUB_TOKEN in your environment variables to auto-commit changes to GitHub.",
    };
  }

  const contentUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}`;
  const putUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`;

  let lastError = "";

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // 1. Fetch current file SHA from GitHub
      let currentSha: string | undefined;
      const getRes = await fetch(contentUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "Nexturn-Connect-Core",
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      });

      if (getRes.ok) {
        const fileMeta = await getRes.json();
        currentSha = fileMeta.sha;
      } else if (getRes.status !== 404) {
        const getErr = await getRes.text();
        console.warn(`[GITHUB SYNC] Failed to fetch SHA for ${filePath} (status ${getRes.status}): ${getErr}`);
      }

      // 2. Commit file to GitHub branch
      const putRes = await fetch(putUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "Nexturn-Connect-Core",
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: commitMessage,
          content: contentBase64,
          sha: currentSha,
          branch: config.branch,
          committer: {
            name: actorName || "Nexturn System Bot",
            email: "nexturn.kunal@gmail.com",
          },
        }),
      });

      if (putRes.ok) {
        const putData = await putRes.json();
        const commitSha = putData.commit?.sha;
        console.log(`[GITHUB SYNC] Successfully committed ${filePath} to GitHub (${config.branch}) at commit ${commitSha}`);
        return { success: true, commitSha };
      }

      const errBody = await putRes.text();
      lastError = `GitHub API error (${putRes.status}): ${errBody}`;
      console.warn(`[GITHUB SYNC] Attempt ${attempt} failed for ${filePath} (${putRes.status}): ${errBody}`);

      // If 409 Conflict (e.g. branch ref or file SHA changed concurrently), wait and retry
      if (putRes.status === 409 && attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 600));
        continue;
      }

      return { success: false, error: lastError };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      lastError = `GitHub sync network error: ${msg}`;
      console.error(`[GITHUB SYNC] Attempt ${attempt} network error for ${filePath}:`, msg);
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 600));
        continue;
      }
    }
  }

  return { success: false, error: lastError };
}

export async function commitPortalDataToGitHub(
  data: PortalData,
  actor?: { name: string; code: string; role: string; section?: string }
): Promise<{ success: boolean; commitSha?: string; error?: string; skipped?: boolean }> {
  const jsonString = JSON.stringify(data, null, 2);
  const base64Content = Buffer.from(jsonString, "utf-8").toString("base64");

  const actorName = actor?.name || "Alpha-1 Member";
  const sectionName = actor?.section ? ` [${actor.section}]` : "";
  const commitMessage = `chore(portal): update portal content via Core Admin${sectionName} [by ${actorName}]`;

  return commitFileToGitHub("src/data/portalData.json", base64Content, commitMessage, actorName);
}

export async function commitActivityLogsToGitHub(
  logs: ActivityLogEntry[],
  actorName?: string
): Promise<{ success: boolean; commitSha?: string; error?: string; skipped?: boolean }> {
  const jsonString = JSON.stringify(logs, null, 2);
  const base64Content = Buffer.from(jsonString, "utf-8").toString("base64");
  const author = actorName || "Alpha-1";
  const commitMessage = `chore(audit): update security activity logs [by ${author}]`;

  return commitFileToGitHub("src/data/activityLogs.json", base64Content, commitMessage, author);
}

export async function fetchPortalDataFromGitHub(): Promise<PortalData | null> {
  const config = getGitHubConfig();
  const token = getGitHubToken();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    // 1. Try GitHub API contents endpoint first (direct live branch HEAD, no caching)
    if (token) {
      try {
        const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/src/data/portalData.json?ref=${config.branch}`;
        const apiRes = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "Nexturn-Connect-Core",
            Accept: "application/vnd.github.v3+json",
          },
          signal: controller.signal,
          cache: "no-store",
        });

        if (apiRes.ok) {
          clearTimeout(timeoutId);
          const data = await apiRes.json();
          if (data.content && data.encoding === "base64") {
            const raw = Buffer.from(data.content, "base64").toString("utf-8");
            return JSON.parse(raw) as PortalData;
          }
        }
      } catch {
        // Fall back to raw URL
      }
    }

    // 2. Fallback to raw githubusercontent
    const rawUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/src/data/portalData.json?t=${Date.now()}`;
    const headers: Record<string, string> = {
      "User-Agent": "Nexturn-Connect-Core",
      "Cache-Control": "no-cache",
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

export async function fetchActivityLogsFromGitHub(): Promise<ActivityLogEntry[] | null> {
  const config = getGitHubConfig();
  const token = getGitHubToken();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    // 1. Try GitHub API contents endpoint first (direct live branch HEAD, no caching)
    if (token) {
      try {
        const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/src/data/activityLogs.json?ref=${config.branch}`;
        const apiRes = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "Nexturn-Connect-Core",
            Accept: "application/vnd.github.v3+json",
          },
          signal: controller.signal,
          cache: "no-store",
        });

        if (apiRes.ok) {
          clearTimeout(timeoutId);
          const data = await apiRes.json();
          if (data.content && data.encoding === "base64") {
            const raw = Buffer.from(data.content, "base64").toString("utf-8");
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed as ActivityLogEntry[];
          }
        }
      } catch {
        // Fall back to raw URL
      }
    }

    // 2. Fallback to raw githubusercontent
    const rawUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/src/data/activityLogs.json?t=${Date.now()}`;
    const headers: Record<string, string> = {
      "User-Agent": "Nexturn-Connect-Core",
      "Cache-Control": "no-cache",
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
      if (Array.isArray(parsed)) {
        return parsed as ActivityLogEntry[];
      }
    }
    return null;
  } catch (err) {
    console.warn("[GITHUB SYNC] Could not fetch remote activity logs from GitHub:", (err as Error)?.message);
    return null;
  }
}

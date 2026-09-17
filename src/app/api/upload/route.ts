import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import { commitFileToGitHub } from "@/lib/githubSync";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (session.accessLevel !== "ALPHA_1") {
    return NextResponse.json(
      { error: "Access Denied: Alpha-1 clearance required to upload images." },
      { status: 403 }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let buffer: Buffer;
    let mimeType = "image/jpeg";
    let slot = "candidate";
    let clientDataUrl: string | null = null;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      slot = String(body.slot || "candidate");
      const rawUrl = body.image || body.dataUrl;
      if (!rawUrl || typeof rawUrl !== "string") {
        return NextResponse.json({ error: "No image data provided" }, { status: 400 });
      }
      const match = rawUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        return NextResponse.json({ error: "Invalid data URL format provided" }, { status: 400 });
      }
      mimeType = match[1];
      buffer = Buffer.from(match[2], "base64");
      clientDataUrl = rawUrl;
    } else {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      slot = String(formData.get("slot") || "candidate");
      const providedDataUrl = formData.get("dataUrl") as string | null;

      if (providedDataUrl && typeof providedDataUrl === "string" && providedDataUrl.startsWith("data:image/")) {
        clientDataUrl = providedDataUrl;
      }

      if (!file && !clientDataUrl) {
        return NextResponse.json({ error: "No image file provided" }, { status: 400 });
      }

      if (file) {
        if (!file.type.startsWith("image/")) {
          return NextResponse.json(
            { error: "Only image files (JPG, PNG, WEBP, GIF) are supported." },
            { status: 400 }
          );
        }

        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json({ error: "File exceeds 10MB limit." }, { status: 400 });
        }

        mimeType = file.type || "image/jpeg";
        const bytes = await file.arrayBuffer();
        buffer = Buffer.from(bytes);
      } else if (clientDataUrl) {
        const match = clientDataUrl.match(/^data:([^;]+);base64,(.+)$/);
        mimeType = match ? match[1] : "image/jpeg";
        buffer = Buffer.from(match ? match[2] : "", "base64");
      } else {
        return NextResponse.json({ error: "No image data found" }, { status: 400 });
      }
    }

    const extMap: Record<string, string> = {
      "image/webp": ".webp",
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/svg+xml": ".svg",
    };
    const safeExt = extMap[mimeType.toLowerCase()] || ".jpg";
    const fileName = `talent-${slot}-${Date.now()}${safeExt}`;
    const base64String = buffer.toString("base64");
    const dataUrl = clientDataUrl || `data:${mimeType};base64,${base64String}`;

    // 1. Graceful local disk write (works on local dev, safely caught on serverless / Vercel)
    let localSaved = false;
    try {
      const uploadDir = path.join(process.cwd(), "public", "talents");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);
      localSaved = true;
    } catch (diskErr) {
      // Expected in Vercel Serverless environment where /var/task is read-only
      console.warn("[UPLOAD API] Local disk write skipped (serverless environment):", (diskErr as Error)?.message);
    }

    // 2. Persist to GitHub repository master branch if GITHUB_TOKEN is available
    let githubSynced = false;
    let githubCommitSha: string | undefined;
    try {
      const ghResult = await commitFileToGitHub(
        `public/talents/${fileName}`,
        base64String,
        `chore(talent): upload photo for candidate slot ${slot} [by ${session.user}]`,
        session.user
      );
      githubSynced = ghResult.success;
      githubCommitSha = ghResult.commitSha;
    } catch (ghErr) {
      console.warn("[UPLOAD API] GitHub commit warning:", ghErr);
    }

    return NextResponse.json({
      success: true,
      url: dataUrl,
      fileName,
      localSaved,
      githubSynced,
      commitSha: githubCommitSha,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Image upload failed:", msg);
    return NextResponse.json({ error: `Upload failed: ${msg}` }, { status: 500 });
  }
}

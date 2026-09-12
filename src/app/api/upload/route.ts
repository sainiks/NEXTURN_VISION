import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

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
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const slot = (formData.get("slot") as string) || "candidate";

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Validate mime type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files (JPG, PNG, WEBP, GIF) are supported." },
        { status: 400 }
      );
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 10MB limit." }, { status: 400 });
    }

    const ext = path.extname(file.name) || ".png";
    const allowedExts = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"];
    const safeExt = allowedExts.includes(ext.toLowerCase()) ? ext.toLowerCase() : ".png";

    const fileName = `talent-${slot}-${Date.now()}${safeExt}`;
    const uploadDir = path.join(process.cwd(), "public", "talents");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/talents/${fileName}`,
      fileName,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Image upload failed:", msg);
    return NextResponse.json({ error: `Upload failed: ${msg}` }, { status: 500 });
  }
}

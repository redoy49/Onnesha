import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_SECRET || process.env.NEXT_PUBLIC_ADMIN_SECRET || "onnesha@admin2026";
  const headerToken =
    req.headers.get("x-admin-token") ||
    req.headers.get("x-admin-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (headerToken && headerToken.trim() === adminSecret.trim()) {
    return true;
  }

  // Allow in dev mode
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY || "";
  const maskedKey = key.length > 8 ? `${key.slice(0, 6)}...${key.slice(-4)}` : key ? "configured" : "";

  return NextResponse.json({
    success: true,
    hasGeminiKey: Boolean(key),
    maskedKey,
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { geminiApiKey } = await req.json();
    if (!geminiApiKey || typeof geminiApiKey !== "string") {
      return NextResponse.json({ success: false, error: "Invalid API key" }, { status: 400 });
    }

    const cleanKey = geminiApiKey.trim();
    process.env.GEMINI_API_KEY = cleanKey;

    // Persist to .env.local
    const envPath = path.join(process.cwd(), ".env.local");
    let content = "";
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, "utf-8");
      if (content.includes("GEMINI_API_KEY=")) {
        content = content.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${cleanKey}`);
      } else {
        content += `\nGEMINI_API_KEY=${cleanKey}\n`;
      }
    } else {
      content = `# Local Environment\nGEMINI_API_KEY=${cleanKey}\nNEXT_PUBLIC_ADMIN_SECRET=onnesha@admin2026\n`;
    }

    fs.writeFileSync(envPath, content, "utf-8");

    return NextResponse.json({
      success: true,
      message: "Gemini API key saved to .env.local and activated in memory.",
      hasGeminiKey: true,
      maskedKey: `${cleanKey.slice(0, 6)}...${cleanKey.slice(-4)}`,
    });
  } catch (err: any) {
    console.error("Save config error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to save key" }, { status: 500 });
  }
}

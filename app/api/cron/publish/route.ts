import { NextRequest, NextResponse } from "next/server";
import { runAutomatedPublishingPipeline } from "@/lib/ai/automation-agent";
import { getAutomationConfig } from "@/lib/ai/automation-config";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60 seconds on serverless for deep research + writing

function isAuthorized(req: NextRequest): boolean {
  // If in development or demo mode, allow manual triggers freely
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // If no secret configured yet, warn and allow to avoid lockouts during initial setup
    return true;
  }

  // 1. Check Bearer token header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.replace(/^Bearer\s+/i, "") === cronSecret) {
    return true;
  }

  // 2. Check query param (?secret=...)
  const url = new URL(req.url);
  const secretParam = url.searchParams.get("secret");
  if (secretParam === cronSecret) {
    return true;
  }

  // 3. Check Vercel Cron header
  const vercelCronHeader = req.headers.get("x-vercel-cron");
  if (vercelCronHeader) {
    return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Provide valid CRON_SECRET." },
      { status: 401 }
    );
  }

  const config = await getAutomationConfig();
  if (!config.enabled) {
    return NextResponse.json({
      success: true,
      message: "Daily automation is currently paused in dashboard configuration.",
      config,
    });
  }

  const result = await runAutomatedPublishingPipeline();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Provide valid CRON_SECRET." },
      { status: 401 }
    );
  }

  let customConfig = undefined;
  try {
    const json = await req.json();
    if (json && typeof json === "object") {
      customConfig = json;
    }
  } catch {
    // Body is optional
  }

  const result = await runAutomatedPublishingPipeline(customConfig);
  return NextResponse.json(result);
}

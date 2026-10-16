import { NextRequest, NextResponse } from "next/server";
import { runAutomatedPublishingPipeline } from "@/lib/ai/automation-agent";
import { getAutomationConfig } from "@/lib/ai/automation-config";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60 seconds on serverless for deep research + writing

// Concurrency lock to prevent duplicate concurrent runs
let isPipelineRunning = false;

function isAuthorized(req: NextRequest): boolean {
  // 1. Vercel Cron header (automatically sent by Vercel cloud cron runner)
  const vercelCronHeader = req.headers.get("x-vercel-cron");
  if (vercelCronHeader) {
    return true;
  }

  const cronSecret = process.env.CRON_SECRET;
  const adminSecrets = [
    process.env.ADMIN_SECRET,
    process.env.NEXT_PUBLIC_ADMIN_SECRET,
    "onnesha@admin2026",
    "onnesha2026",
  ].filter(Boolean) as string[];

  // 2. Check Bearer token header (used by GitHub Actions or cURL)
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (cronSecret && token === cronSecret) return true;
    if (adminSecrets.includes(token)) return true;
  }

  // 3. Check custom admin token header (sent by authenticated Admin Dashboard)
  const adminHeader =
    req.headers.get("x-admin-token") ||
    req.headers.get("x-admin-secret") ||
    req.headers.get("x-admin-key");
  if (adminHeader) {
    const token = adminHeader.trim();
    if (cronSecret && token === cronSecret) return true;
    if (adminSecrets.includes(token)) return true;
  }

  // 4. Check query param (?secret=...)
  const url = new URL(req.url);
  const secretParam = url.searchParams.get("secret");
  if (secretParam) {
    const cleanParam = secretParam.trim();
    if (cronSecret && cleanParam === cronSecret) return true;
    if (adminSecrets.includes(cleanParam)) return true;
  }

  // In non-production or demo environments without secrets configured, allow triggers
  if (process.env.NODE_ENV !== "production" && !cronSecret) {
    return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized: Provide a valid CRON_SECRET or Admin credentials.",
      },
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

  if (isPipelineRunning) {
    return NextResponse.json(
      {
        success: false,
        error: "An automation run is already in progress. Please wait for it to complete.",
      },
      { status: 429 }
    );
  }

  try {
    isPipelineRunning = true;
    const result = await runAutomatedPublishingPipeline();
    return NextResponse.json(result);
  } finally {
    isPipelineRunning = false;
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized: Provide a valid CRON_SECRET or Admin credentials.",
      },
      { status: 401 }
    );
  }

  if (isPipelineRunning) {
    return NextResponse.json(
      {
        success: false,
        error: "An automation run is already in progress. Please wait for it to complete.",
      },
      { status: 429 }
    );
  }

  let customTopic: string | undefined = undefined;
  let forceDraft = false;
  let customConfig = undefined;

  try {
    const json = await req.json();
    if (json && typeof json === "object") {
      customTopic = typeof json.customTopic === "string" ? json.customTopic : undefined;
      forceDraft = Boolean(json.forceDraft);
      customConfig = json.customConfig || (json.enabled !== undefined ? json : undefined);
    }
  } catch {
    // Body is optional
  }

  try {
    isPipelineRunning = true;
    const result = await runAutomatedPublishingPipeline({
      customTopic,
      forceDraft,
      customConfig,
    });
    return NextResponse.json(result);
  } finally {
    isPipelineRunning = false;
  }
}

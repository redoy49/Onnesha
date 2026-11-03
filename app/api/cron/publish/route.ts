import { NextRequest, NextResponse } from "next/server";
import { runAutomatedPublishingPipeline } from "@/lib/ai/automation-agent";
import { getAutomationConfig } from "@/lib/ai/automation-config";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // Allow up to 300 seconds for deep research + writing

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
  let customApiKey: string | undefined = undefined;
  let customConfig = undefined;

  try {
    const json = await req.json();
    if (json && typeof json === "object") {
      customTopic = typeof json.customTopic === "string" ? json.customTopic : undefined;
      forceDraft = Boolean(json.forceDraft);
      customApiKey = typeof json.apiKey === "string" ? json.apiKey : undefined;
      customConfig = json.customConfig || (json.enabled !== undefined ? json : undefined);
    }
  } catch {
    // Body is optional
  }

  const isStream =
    req.nextUrl.searchParams.get("stream") === "true" ||
    req.headers.get("accept")?.includes("text/event-stream");

  if (isStream) {
    const encoder = new TextEncoder();
    let isStreamActive = true;
    let heartbeat: NodeJS.Timeout | null = null;

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => {
          if (!isStreamActive) return;
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch {
            isStreamActive = false;
          }
        };

        // Keep-alive heartbeat every 5s so long-running deep research doesn't drop the HTTP socket
        heartbeat = setInterval(() => {
          if (!isStreamActive) {
            if (heartbeat) clearInterval(heartbeat);
            return;
          }
          try {
            controller.enqueue(encoder.encode(`: ping\n\n`));
          } catch {
            isStreamActive = false;
            if (heartbeat) clearInterval(heartbeat);
          }
        }, 5000);

        try {
          isPipelineRunning = true;
          const result = await runAutomatedPublishingPipeline({
            customTopic,
            forceDraft,
            apiKey: customApiKey,
            customConfig,
            onProgress: (step, message, sourcesCount) => {
              send({ type: "progress", step, message, sourcesCount });
            },
          });
          send({ type: "completed", result });
          if (isStreamActive) {
            try {
              controller.close();
            } catch {}
          }
        } catch (err: any) {
          send({ type: "error", error: err.message || "Failed execution" });
          if (isStreamActive) {
            try {
              controller.close();
            } catch {}
          }
        } finally {
          isStreamActive = false;
          if (heartbeat) clearInterval(heartbeat);
          isPipelineRunning = false;
        }
      },
      cancel() {
        isStreamActive = false;
        if (heartbeat) clearInterval(heartbeat);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  try {
    isPipelineRunning = true;
    const result = await runAutomatedPublishingPipeline({
      customTopic,
      forceDraft,
      apiKey: customApiKey,
      customConfig,
    });
    return NextResponse.json(result);
  } finally {
    isPipelineRunning = false;
  }
}

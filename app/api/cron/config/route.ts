import { NextRequest, NextResponse } from "next/server";
import {
  getAutomationConfig,
  updateAutomationConfig,
  getAutomationLogs,
  AutomationConfig,
} from "@/lib/ai/automation-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getAutomationConfig();
    const logs = await getAutomationLogs(30);

    return NextResponse.json({
      success: true,
      config,
      logs,
    });
  } catch (err) {
    console.error("GET /api/cron/config error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch automation config" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<AutomationConfig>;
    const updated = await updateAutomationConfig(body);

    return NextResponse.json({
      success: true,
      config: updated,
    });
  } catch (err) {
    console.error("POST /api/cron/config error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update automation config" },
      { status: 500 }
    );
  }
}

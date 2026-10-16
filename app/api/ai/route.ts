import { NextRequest, NextResponse } from "next/server";
import { AiRequestSchema } from "@/lib/ai/types";
import { processAiRequest } from "@/lib/ai/service";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = AiRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request payload",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const result = await processAiRequest(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Route Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal AI processing error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Health / discovery endpoint for the AccentAI API. */
export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "AccentAI API",
    version: "1.0",
    endpoints: [
      { path: "/api/ai-coach", method: "POST", description: "AI pronunciation coach (streaming SSE)" },
      { path: "/api/dictionary", method: "GET", description: "Dictionary lookup with IPA + pronunciation" },
    ],
    timestamp: new Date().toISOString(),
  });
}

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store, max-age=0" };

export async function POST(request: NextRequest) {
  // Only the local application can request tokens through a browser. No client-supplied agent IDs.
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "This call must start from the ZERO website." }, { status: 403, headers });
  }
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  if (!apiKey || !agentId) {
    return NextResponse.json({ error: "Voice setup is incomplete. Add the ElevenLabs API key and agent ID, then restart the app." }, { status: 503, headers });
  }
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`, {
      method: "GET",
      headers: { "xi-api-key": apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) {
      // Do not relay provider error bodies: they can contain account/configuration details.
      return NextResponse.json({ error: "We couldn’t connect to Guest Services. Please try again." }, { status: 502, headers });
    }
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("token" in data) || typeof data.token !== "string" || !data.token) {
      return NextResponse.json({ error: "We couldn’t connect to Guest Services. Please try again." }, { status: 502, headers });
    }
    return NextResponse.json({ conversationToken: data.token }, { headers });
  } catch {
    return NextResponse.json({ error: "We couldn’t connect to Guest Services. Please try again." }, { status: 502, headers });
  }
}

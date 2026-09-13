import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../app/api/elevenlabs-token/route";

const makeRequest = (origin = "http://localhost:3100") => new NextRequest("http://localhost:3100/api/elevenlabs-token", { method: "POST", headers: { origin } });

test("token route enforces origin, fails clearly without configuration, and keeps the secret server-side", async () => {
  const previousKey = process.env.ELEVENLABS_API_KEY;
  const previousAgent = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  const originalFetch = globalThis.fetch;
  try {
    assert.equal((await POST(makeRequest("https://other.example"))).status, 403);
    delete process.env.ELEVENLABS_API_KEY;
    delete process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
    const missing = await POST(makeRequest());
    assert.equal(missing.status, 503);
    assert.match(missing.headers.get("Cache-Control")!, /no-store/);

    process.env.ELEVENLABS_API_KEY = "unit-test-secret";
    process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID = "agent_test";
    let upstreamCalls = 0;
    globalThis.fetch = async (url, options) => {
      upstreamCalls++;
      assert.equal(String(url), "https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=agent_test");
      assert.equal(new Headers(options?.headers).get("xi-api-key"), "unit-test-secret");
      assert.equal(options?.cache, "no-store");
      return Response.json({ token: "temporary-token", conversation_id: "conversation_test" });
    };
    const success = await POST(makeRequest());
    assert.equal(success.status, 200);
    assert.deepEqual(await success.json(), { conversationToken: "temporary-token" });
    assert.equal(upstreamCalls, 1);

    globalThis.fetch = async () => new Response("sensitive provider diagnostic", { status: 401 });
    const failure = await POST(makeRequest());
    assert.equal(failure.status, 502);
    assert.doesNotMatch(await failure.text(), /sensitive|unit-test-secret/);

    globalThis.fetch = async () => Response.json({ token: "" });
    assert.equal((await POST(makeRequest())).status, 502);
    globalThis.fetch = async () => { throw new Error("upstream timed out"); };
    assert.equal((await POST(makeRequest())).status, 502);
  } finally {
    globalThis.fetch = originalFetch;
    if (previousKey === undefined) delete process.env.ELEVENLABS_API_KEY;
    else process.env.ELEVENLABS_API_KEY = previousKey;
    if (previousAgent === undefined) delete process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
    else process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID = previousAgent;
  }
});

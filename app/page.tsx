import { MockOperator } from "@/components/MockOperator";
import { Operator } from "@/components/Operator";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ preview?: string; scenario?: string }> }) {
  const query = await searchParams;
  const development = process.env.NODE_ENV === "development";
  if (development && process.env.ZERO_ENABLE_PREVIEW === "true" && query.preview === "1") return <MockOperator scenario={query.scenario === "wifi" || query.scenario === "water" ? query.scenario : "towels"}/>;
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ?? "";
  const publicAgent = development && process.env.ZERO_PUBLIC_AGENT === "true";
  const configured = Boolean(agentId && (publicAgent || process.env.ELEVENLABS_API_KEY));
  return <Operator agentId={agentId} publicAgent={publicAgent} configurationWarning={configured ? undefined : "Configure the ElevenLabs agent and credentials to enable calls."}/>;
}

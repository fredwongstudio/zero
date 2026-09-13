"use client";

import { useEffect, useRef, useState } from "react";
import { Experience } from "./Experience";
import type { CallStatus } from "@/lib/types";
import type { TranscriptEntry } from "@/lib/types";
import { createServiceRequest, hasWifiResponse } from "@/lib/serviceRequests";

// Development-only interaction fixture. Never presented as a live conversation.
export function MockOperator({ scenario = "towels" }: { scenario?: "towels" | "water" | "wifi" }) {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { if (status !== "connected") return; const id = setInterval(() => setDuration(v => v + 1), 1000); return () => clearInterval(id); }, [status]);
  const completed = duration >= 4;
  const transcript: TranscriptEntry[] = !completed ? [] : scenario === "wifi" ? [
    { role: "user", text: "What’s the Wi-Fi password?" },
    { role: "agent", text: "Certainly. The network is Room Eleven and the password is welcometozero. Is there anything else I can assist you with?" },
  ] : [
    { role: "user", text: scenario === "water" ? "Could I get two bottles of water?" : "Can you send two towels to my room?" },
    { role: "agent", text: `Of course. I’ll arrange for two ${scenario === "water" ? "bottles of water" : "towels"} to be sent to Room 110. Is there anything else I can assist you with?` },
  ];
  const request = completed && scenario !== "wifi" ? createServiceRequest({ room: "110", requestType: "amenity_request", item: scenario === "water" ? "bottled_water" : "extra_towels", quantity: 2, department: "Housekeeping" }) : null;
  return <Experience callStatus={status} micMuted={muted} callDuration={duration} isSpeaking={duration < 3} latestRequest={request} wifiResolved={hasWifiResponse(transcript)} transcript={transcript} error={null} preview onMute={() => setMuted(v => !v)} onStart={() => {setStatus("connecting"); setDuration(0); setMuted(false); timer.current = setTimeout(() => setStatus("connected"), 700);}} onEnd={() => {if (timer.current) clearTimeout(timer.current); setStatus("ended");}}/>;
}

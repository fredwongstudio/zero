"use client";

import { ConversationProvider, useConversation, type HookCallbacks } from "@elevenlabs/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Experience } from "./Experience";
import { createServiceRequest, hasWifiResponse } from "@/lib/serviceRequests";
import type { CallStatus, ServiceRequest, TranscriptEntry } from "@/lib/types";

const CONNECTION_ERROR = "We couldn’t connect to Guest Services. Please try again.";
const MIC_ERROR = "We need microphone access for the voice call. Please allow microphone access and try again.";
type MessagePayload = Parameters<NonNullable<HookCallbacks["onMessage"]>>[0];

type OperatorProps = { agentId: string; publicAgent: boolean; configurationWarning?: string };
type SessionProps = OperatorProps & {
  onConnected: () => void;
  onEnded: () => void;
  onFailure: (message: string) => void;
  onMessage: (message: MessagePayload) => void;
  onRequest: (request: ServiceRequest) => void;
  onSpeaking: (speaking: boolean) => void;
};

/** Mount exactly one SDK provider per call; unmounting releases that session. */
function VoiceSession(props: SessionProps) {
  const alive = useRef(false);
  const deadline = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearDeadline = () => { if (deadline.current) clearTimeout(deadline.current); };
  const { startSession, endSession } = useConversation({
    onConnect: () => { if (alive.current) { clearDeadline(); props.onConnected(); } },
    onDisconnect: details => {
      if (!alive.current) return;
      clearDeadline();
      if (details.reason === "error") props.onFailure(CONNECTION_ERROR);
      else props.onEnded();
    },
    onError: () => {
      if (alive.current) { clearDeadline(); props.onFailure(CONNECTION_ERROR); }
    },
    onMessage: message => { if (alive.current) props.onMessage(message); },
    onModeChange: ({ mode }) => { if (alive.current) props.onSpeaking(mode === "speaking"); },
    clientTools: {
      createServiceRequest: parameters => {
        if (!alive.current) return JSON.stringify({ status: "error", message: "The call has ended." });
        try {
          const request = createServiceRequest(parameters);
          props.onRequest(request);
          return JSON.stringify(request);
        } catch (error) {
          return JSON.stringify({ status: "error", message: error instanceof Error ? error.message : "Please clarify the request." });
        }
      },
    },
  });

  useEffect(() => {
    alive.current = true;
    let cancelled = false;
    const controller = new AbortController();
    deadline.current = setTimeout(() => {
      if (!cancelled) {
        controller.abort();
        endSession();
        props.onFailure("The call took too long to connect. Please try again.");
      }
    }, 30_000);
    async function connect() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("MIC_UNAVAILABLE");
        // Release the permission-check stream immediately. The SDK owns the call's audio stream.
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        if (cancelled) return;
        if (props.publicAgent) {
          startSession({ agentId: props.agentId, connectionType: "webrtc", dynamicVariables: { room: "110" } });
        } else {
          const response = await fetch("/api/elevenlabs-token", { method: "POST", signal: controller.signal });
          const data: unknown = await response.json();
          if (cancelled) return;
          if (!response.ok || !data || typeof data !== "object" || !("conversationToken" in data) || typeof data.conversationToken !== "string") throw new Error("CONNECTION_FAILED");
          startSession({ conversationToken: data.conversationToken, connectionType: "webrtc", dynamicVariables: { room: "110" } });
        }
      } catch (error) {
        if (cancelled) return;
        clearDeadline();
        const denied = error instanceof Error && ["NotAllowedError", "PermissionDeniedError"].includes(error.name);
        const noMic = error instanceof Error && (error.name === "NotFoundError" || error.message === "MIC_UNAVAILABLE");
        props.onFailure(denied ? MIC_ERROR : noMic ? "No microphone is available. Connect a microphone and use localhost or HTTPS, then try again." : CONNECTION_ERROR);
      }
    }
    void connect();
    return () => {
      cancelled = true;
      alive.current = false;
      clearDeadline();
      controller.abort();
      endSession();
    };
    // Call configuration is fixed for this mount. Provider callbacks remain fresh through the SDK.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.agentId, props.publicAgent, startSession, endSession]);
  return null;
}

export function Operator(props: OperatorProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [active, setActive] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeaking, setSpeaking] = useState(false);
  const [latestRequest, setLatestRequest] = useState<ServiceRequest | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const connectedAt = useRef<number | null>(null);

  const onConnected = useCallback(() => {
    connectedAt.current = Date.now();
    setCallStatus("connected");
  }, []);

  const finish = useCallback((failure?: string) => {
    if (connectedAt.current !== null) setCallDuration(Math.floor((Date.now() - connectedAt.current) / 1000));
    connectedAt.current = null;
    busy.current = false;
    setActive(false);
    setSpeaking(false);
    setMicMuted(false);
    setCallStatus(failure ? "error" : "ended");
    setError(failure ?? null);
  }, []);
  const onEnded = useCallback(() => finish(), [finish]);
  const onFailure = useCallback((message: string) => finish(message), [finish]);
  const onMessage = useCallback((message: MessagePayload) => {
    if (!message.message.trim() || !["agent", "user"].includes(message.role)) return;
    const entry: TranscriptEntry = { role: message.role, text: message.message, eventId: message.event_id };
    setTranscript(previous => {
      const index = message.event_id === undefined ? -1 : previous.findIndex(item => item.eventId === message.event_id && item.role === message.role);
      return index < 0 ? [...previous, entry] : previous.map((item, i) => i === index ? entry : item);
    });
  }, []);

  useEffect(() => {
    if (callStatus !== "connected") return;
    const timer = setInterval(() => { if (connectedAt.current !== null) setCallDuration(Math.floor((Date.now() - connectedAt.current) / 1000)); }, 500);
    return () => clearInterval(timer);
  }, [callStatus]);

  function start() {
    if (busy.current) return;
    setError(null);
    setLatestRequest(null);
    setTranscript([]);
    setCallDuration(0);
    setMicMuted(false);
    setSpeaking(false);
    if (props.configurationWarning) {
      setError("Guest Services isn’t connected yet. Complete the voice setup to make a call.");
      setCallStatus("error");
      return;
    }
    busy.current = true;
    setCallStatus("connecting");
    setActive(true);
  }

  return <>
    {active && <ConversationProvider isMuted={micMuted} onMutedChange={setMicMuted}><VoiceSession {...props} onConnected={onConnected} onEnded={onEnded} onFailure={onFailure} onMessage={onMessage} onRequest={setLatestRequest} onSpeaking={setSpeaking}/></ConversationProvider>}
    <Experience callStatus={callStatus} micMuted={micMuted} callDuration={callDuration} isSpeaking={isSpeaking} latestRequest={latestRequest} wifiResolved={hasWifiResponse(transcript)} transcript={transcript} error={error} configurationWarning={props.configurationWarning} onStart={start} onEnd={onEnded} onMute={() => setMicMuted(muted => !muted)}/>
  </>;
}

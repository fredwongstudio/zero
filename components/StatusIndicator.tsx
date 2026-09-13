import type { CallViewProps } from "@/lib/types";
import { formatDuration } from "@/lib/hotelConfig";

export function StatusIndicator({ callStatus, callDuration, isSpeaking, micMuted }: Pick<CallViewProps, "callStatus" | "callDuration" | "isSpeaking" | "micMuted">) {
  const connected = callStatus === "connected";
  const label = { idle: "Ready to call", connecting: "Connecting…", connected: "Connected", ended: "Call ended", error: "Unable to connect" }[callStatus];
  return <div className={`phone-display ${connected ? "display-connected" : ""}`}>
    <div className="display-top"><span>ROOM 110</span><span className="signal" aria-hidden="true">▂▄▆</span></div>
    <h2>Guest Services</h2>
    <div className="connection-line"><span className={`status-dot ${connected ? "online" : ""}`} aria-hidden="true"/><span role="status">{label}</span>{connected && <span className="timer" aria-label={`Call duration ${formatDuration(callDuration)}`}> · {formatDuration(callDuration)}</span>}</div>
    <div className="display-bottom" aria-live="polite">{connected ? (isSpeaking ? "Operator speaking" : micMuted ? "Microphone muted" : "Listening") : callStatus === "connecting" ? "Reaching Guest Services" : "For assistance, dial 0"}</div>
  </div>;
}

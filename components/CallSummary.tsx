import type { CallViewProps } from "@/lib/types";
import { formatDuration } from "@/lib/hotelConfig";

export function CallSummary({ latestRequest, wifiResolved, transcript, callDuration, preview }: Pick<CallViewProps, "latestRequest" | "wifiResolved" | "transcript" | "callDuration" | "preview">) {
  return <section className="call-summary" aria-labelledby="summary-heading" aria-live="polite">
    <div className="summary-heading"><div><p className="eyebrow">{preview ? "SCRIPTED PREVIEW" : "AFTER THE CALL"}</p><h2 id="summary-heading">What the AI understood</h2></div><span>{formatDuration(callDuration)}</span></div>
    {latestRequest && <><p className="summary-context">Latest service request · simulated</p><dl className="summary-grid"><div><dt>Room</dt><dd>{latestRequest.room}</dd></div><div><dt>Request</dt><dd>{latestRequest.item === "extra_towels" ? "Extra towels" : "Bottled water"}</dd></div><div><dt>Quantity</dt><dd>{latestRequest.quantity}</dd></div><div><dt>Department</dt><dd>{latestRequest.department}</dd></div><div><dt>Status</dt><dd>Request created</dd></div></dl></>}
    {wifiResolved && <dl className="summary-grid wifi-summary"><div><dt>Intent</dt><dd>Wi-Fi information</dd></div><div><dt>Response</dt><dd>Information provided</dd></div><div><dt>Status</dt><dd>Resolved during call</dd></div></dl>}
    {!latestRequest && !wifiResolved && <p className="summary-empty">No completed service request or Wi-Fi response was recorded during this call.</p>}
    {transcript.length > 0 && <details className="transcript"><summary>Conversation transcript <span aria-hidden="true">+</span></summary><ol>{transcript.map((entry, i) => <li key={i}><span>{entry.role === "agent" ? "Operator" : "Guest"}</span><p>{entry.text}</p></li>)}</ol><p className="transcript-note">Live transcription may contain errors. {preview ? "This conversation is scripted." : "Only received session messages are shown."}</p></details>}
    <p className="summary-footnote">For demonstration only. No request is sent to hotel staff.</p>
  </section>;
}

import { MicIcon, PhoneIcon } from "./Icons";

export function CallControls({ micMuted, onMute, onEnd }: { micMuted: boolean; onMute: () => void; onEnd: () => void }) {
  return <div className="call-controls"><button type="button" className="mute-button" onClick={onMute} aria-label={micMuted ? "Unmute microphone" : "Mute microphone"} aria-pressed={micMuted}><MicIcon muted={micMuted}/>{micMuted ? "Unmute" : "Mute"}</button><button type="button" className="end-button" onClick={onEnd}><PhoneIcon end/>End call</button></div>;
}

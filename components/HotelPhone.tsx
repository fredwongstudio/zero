import type { CallViewProps } from "@/lib/types";
import { DialPad } from "./DialPad";
import { CallControls } from "./CallControls";
import { StatusIndicator } from "./StatusIndicator";
import { MicIcon, PhoneIcon } from "./Icons";

export function HotelPhone(props: CallViewProps) {
  const connected = props.callStatus === "connected";
  const connecting = props.callStatus === "connecting";
  return <section className="phone-stage" aria-label="Room 110 hotel phone">
    <div className="hotel-phone">
      <div className="handset" aria-hidden="true"><div className="handset-speaker"/><div className="handset-grip"/><div className="handset-speaker"/></div>
      <div className="phone-body">
        <div className="phone-brand"><span>ZERO</span><span>IN-ROOM TELEPHONE</span></div>
        <StatusIndicator {...props}/>
        {connected ? <div className="active-call"><div className={`voice-wave ${props.isSpeaking ? "speaking" : ""} ${props.micMuted ? "muted" : ""}`} aria-hidden="true">{Array.from({length: 21}, (_, i) => <i key={i} style={{"--bar": `${12 + Math.sin(i * 1.4) ** 2 * 36}px`, "--delay": `${i * -.11}s`} as React.CSSProperties}/>)}</div><p>{props.isSpeaking ? "A little help, just a call away." : "Go ahead. We’re listening."}</p><CallControls micMuted={props.micMuted} onMute={props.onMute} onEnd={props.onEnd}/></div> : <DialPad onStart={props.onStart} disabled={connecting}/>}
        <div className="phone-foot"><MicIcon muted={props.micMuted}/><span>{props.preview ? "Microphone not used" : connected ? props.micMuted ? "Microphone muted" : "Microphone on" : "Microphone off"}</span></div>
        {connecting && <button type="button" className="cancel-call" onClick={props.onEnd}>Cancel call</button>}
      </div>
    </div>
    <p className="phone-caption"><PhoneIcon/>Your room. One touch away.</p>
  </section>;
}

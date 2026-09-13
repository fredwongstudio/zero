import type { CallViewProps } from "@/lib/types";
import { description } from "@/lib/hotelConfig";
import { HotelPhone } from "./HotelPhone";
import { InstructionPanel } from "./InstructionPanel";
import { CallSummary } from "./CallSummary";

export function Experience(props: CallViewProps) {
  return <div className="site-shell">
    <header className="site-header"><a href="/" aria-label="Fred Wong Studio — ZERO home">FRED WONG <span>STUDIO</span></a><span className="project-label">AI HOTEL OPERATOR PROTOTYPE</span></header>
    <main id="main"><div className="intro"><div className="wordmark-row"><h1>ZERO<span className="wordmark-period">.</span></h1><span className="edition">WORKING PROTOTYPE<br/>NO. 01 / 2026</span></div><div className="intro-bottom"><p className="tagline">Dial 0. Just ask.</p><p className="byline">A working AI hotel operator prototype<br className="desktop-break"/> by Fred Wong Studio.</p></div></div>
      {props.preview && <div className="preview-banner" role="note">Scripted preview · No live AI or microphone. Press 0 to preview a sample call.</div>}
      {props.configurationWarning && <div className="configuration-note" role="note"><strong>Voice setup needed.</strong> {props.configurationWarning}</div>}
      <div className="experience-grid"><HotelPhone {...props}/><InstructionPanel preview={props.preview}/></div>
      {props.error && <div className="error-notice" role="alert">{props.error}</div>}
      {(props.callStatus === "ended" || props.callStatus === "error") && <CallSummary {...props}/>}
      <div className="about-project"><p className="eyebrow">ABOUT THIS PROTOTYPE</p><p>{description}</p></div>
    </main>
    <footer><span>Built by Fred Wong Studio · <a className="text-inherit no-underline hover:underline underline-offset-4" href="mailto:fredwongstudio@gmail.com">fredwongstudio@gmail.com</a></span><span>Thoughtfully imagined. Simply connected.</span></footer>
  </div>;
}

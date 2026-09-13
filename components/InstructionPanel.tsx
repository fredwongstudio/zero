export function InstructionPanel({ preview = false }: { preview?: boolean }) {
  return <aside className="instructions" aria-labelledby="instructions-heading">
    <p className="eyebrow">A FAMILIAR GESTURE. A NEW CONVERSATION.</p>
    <h2 id="instructions-heading">Try the AI Operator</h2>
    <p className="instructions-lead">Press <span className="inline-zero">0</span>, then speak naturally.</p>
    <div className="example-prompts"><p className="eyebrow">MAKE YOURSELF AT HOME</p><ul><li>“Can you send two towels to my room?”</li><li>“Could I get two bottles of water?”</li><li>“What’s the Wi-Fi password?”</li></ul></div>
    <p className="follow-up">The operator may ask a follow-up question if information is missing.</p>
    <p className="mic-note">{preview ? "Your microphone is not used in this scripted preview." : "Your microphone will be used during the call."}</p>
    <div className="prototype-note"><span className="note-mark" aria-hidden="true">i</span><p>{preview ? "A fictional hotel. A scripted sample call." : "A fictional hotel. A real voice conversation."}<br/>Service requests are simulated.</p></div>
  </aside>;
}

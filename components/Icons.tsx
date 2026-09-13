export function PhoneIcon({ end = false }: { end?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className={end ? "icon end-icon" : "icon"}><path d="M6.6 3H3.8A1.8 1.8 0 0 0 2 4.9C2.7 14 10 21.3 19.1 22a1.8 1.8 0 0 0 1.9-1.8v-2.8l-5-2-2 2a15.1 15.1 0 0 1-7.4-7.4l2-2-2-5Z" strokeLinejoin="round"/></svg>;
}
export function MicIcon({ muted = false }: { muted?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="icon" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>{muted && <path d="m3 3 18 18" strokeWidth="2"/>}</svg>;
}

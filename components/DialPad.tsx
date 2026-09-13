const keys = [["1", ""], ["2", "ABC"], ["3", "DEF"], ["4", "GHI"], ["5", "JKL"], ["6", "MNO"], ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"]];

export function DialPad({ onStart, disabled }: { onStart: () => void; disabled: boolean }) {
  return <div className="dialpad" aria-label="Hotel phone keypad">
    {keys.map(([number, letters]) => <button className="number-key" key={number} type="button" aria-label={`${number}, unavailable; press 0 for Operator`} disabled><span>{number}</span><small>{letters || "\u00a0"}</small></button>)}
    <button className="number-key symbol-key" type="button" aria-label="Star, unavailable" disabled>∗</button>
    <button className="operator-key" type="button" onClick={onStart} disabled={disabled} aria-label="0 — Call Operator"><span>0</span><small>OPERATOR</small></button>
    <button className="number-key symbol-key" type="button" aria-label="Hash, unavailable" disabled>#</button>
  </div>;
}

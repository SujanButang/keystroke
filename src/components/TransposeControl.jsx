import './TransposeControl.css'

export default function TransposeControl({ value, onChange }) {
  return (
    <div className="transpose">
      <span className="transpose-label">transpose</span>
      <div className="transpose-controls">
        <button className="transpose-btn" onClick={() => onChange(value - 1)} disabled={value <= -11}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <span className={`transpose-value ${value !== 0 ? 'active' : ''}`}>
          {value > 0 ? `+${value}` : value}
        </span>
        <button className="transpose-btn" onClick={() => onChange(value + 1)} disabled={value >= 11}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
      <button
        className="transpose-reset"
        onClick={() => onChange(0)}
        style={{ visibility: value !== 0 ? 'visible' : 'hidden' }}
        tabIndex={value !== 0 ? 0 : -1}
      >reset</button>
    </div>
  )
}

import './HelpPanel.css'

const CHORD_REFS = [
  { input: 'c', label: 'C major' },
  { input: 'cm', label: 'C minor' },
  { input: 'cs', label: 'C# major' },
  { input: 'csm', label: 'C# minor' },
  { input: 'd', label: 'D major' },
  { input: 'dm', label: 'D minor' },
  { input: 'e', label: 'E major' },
  { input: 'em', label: 'E minor' },
  { input: 'f', label: 'F major' },
  { input: 'fm', label: 'F minor' },
  { input: 'g', label: 'G major' },
  { input: 'gm', label: 'G minor' },
  { input: 'a', label: 'A major' },
  { input: 'am', label: 'A minor' },
  { input: 'b', label: 'B major' },
  { input: 'bm', label: 'B minor' },
]

export default function HelpPanel({ isOpen, onClose }) {
  return (
    <>
      <div className={`panel-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`help-panel ${isOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <h2>Chord Reference</h2>
          <button className="panel-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <p className="panel-hint">Type these keys to play chords. 400ms debounce.</p>
        <div className="chord-grid">
          {CHORD_REFS.map(({ input, label }) => (
            <div key={input} className="chord-ref-row">
              <kbd>{input}</kbd>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="panel-tip">
          <strong>Tip:</strong> Modifier keys (ctrl, alt, cmd) are ignored.
        </div>
      </aside>
    </>
  )
}

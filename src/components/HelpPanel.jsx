import './HelpPanel.css'

const CONTROLS = [
  { keys: ['A–G'], label: 'Major chord' },
  { keys: ['Shift', 'A–G'], label: 'Minor chord' },
  { keys: ['Ctrl', 'A–G'], label: 'Sharp major' },
  { keys: ['Ctrl', 'Shift', 'A–G'], label: 'Sharp minor' },
  { keys: ['Hold key'], label: 'Sustain chord' },
]

const CHORD_REFS = [
  { key: 'C', sharp: true },
  { key: 'D', sharp: true },
  { key: 'E', sharp: false },
  { key: 'F', sharp: true },
  { key: 'G', sharp: true },
  { key: 'A', sharp: true },
  { key: 'B', sharp: false },
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

        <section className="help-section">
          <h3>Controls</h3>
          {CONTROLS.map(({ keys, label }) => (
            <div key={label} className="chord-ref-row">
              <div className="key-combo">
                {keys.map((k, i) => <kbd key={i}>{k}</kbd>)}
              </div>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section className="help-section">
          <h3>Notes</h3>
          <div className="chord-grid">
            {CHORD_REFS.map(({ key, sharp }) => (
              <div key={key} className="note-row">
                <div className="note-variants">
                  <kbd>{key}</kbd>
                  <span className="note-label">major</span>
                  <kbd className="mod">Shift+{key}</kbd>
                  <span className="note-label">minor</span>
                  {sharp && <>
                    <kbd className="ctrl">Ctrl+{key}</kbd>
                    <span className="note-label">{key}♯ major</span>
                    <kbd className="ctrl mod">Ctrl+Shift+{key}</kbd>
                    <span className="note-label">{key}♯ minor</span>
                  </>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </>
  )
}

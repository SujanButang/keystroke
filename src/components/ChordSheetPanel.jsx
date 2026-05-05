import { useEffect } from 'react'
import './ChordSheetPanel.css'

const PLACEHOLDER = `[Verse 1]
G              Em
Almost heaven, West Virginia
C               G
Blue Ridge Mountains, Shenandoah River
G                Em
Life is old there, older than the trees
D                       G
Younger than the mountains, blowing like a breeze

[Chorus]
G          D
Country roads, take me home
Em         C
To the place I belong
G              D
West Virginia, mountain mama
C             G
Take me home, country roads`

export default function ChordSheetPanel({ isOpen, onClose, text, onTextChange }) {
  useEffect(() => {
    if (!isOpen) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  return (
    <>
      <div
        className={`panel-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`chord-sheet-panel ${isOpen ? 'open' : ''}`}
        aria-label="Edit Song Sheet"
        role="complementary"
      >
        <div className="panel-header cs-panel-header">
          <h2>Song Sheet</h2>
          <button className="panel-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="cs-input-area">
          <textarea
            className="cs-textarea"
            value={text}
            onChange={e => onTextChange(e.target.value)}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            aria-label="Paste chord sheet text"
          />
        </div>

        {text.trim() && (
          <p className="cs-live-hint">Live on main screen</p>
        )}
      </aside>
    </>
  )
}

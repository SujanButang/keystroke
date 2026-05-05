import './WelcomeDialog.css'

export default function WelcomeDialog({ onDismiss, onDontShowAgain }) {
  return (
    <div className="welcome-overlay" onClick={onDismiss}>
      <div className="welcome-dialog" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Welcome to KeyStroke">

        {/* ── Header ── */}
        <div className="wd-header">
          <div className="wd-logo">
            <span className="wd-logo-mark">K</span>
            <span className="wd-logo-text">KeyStroke</span>
          </div>
          <p className="wd-tagline">Press keys. Play chords.</p>
        </div>

        {/* ── Feature sections ── */}
        <div className="wd-body">

          <section className="wd-section">
            <h3 className="wd-section-title">Playing chords</h3>
            <div className="wd-rows">
              <div className="wd-row">
                <div className="wd-keys"><kbd>A</kbd><span className="wd-sep">–</span><kbd>G</kbd></div>
                <span className="wd-desc">Play a major chord</span>
              </div>
              <div className="wd-row">
                <div className="wd-keys"><kbd className="mod">Shift</kbd><kbd>A–G</kbd></div>
                <span className="wd-desc">Minor chord</span>
              </div>
              <div className="wd-row">
                <div className="wd-keys"><kbd className="ctrl">Ctrl</kbd><kbd>A–G</kbd></div>
                <span className="wd-desc">Sharp (♯) chord</span>
              </div>
              <div className="wd-row">
                <div className="wd-keys"><kbd className="ctrl mod">Ctrl</kbd><kbd className="mod">Shift</kbd><kbd>A–G</kbd></div>
                <span className="wd-desc">Sharp minor</span>
              </div>
              <div className="wd-row">
                <div className="wd-keys"><kbd>Hold key</kbd></div>
                <span className="wd-desc">Sustain — release to stop</span>
              </div>
            </div>
            <p className="wd-tip">While holding a note, add or release <kbd className="mod">Shift</kbd> / <kbd className="ctrl">Ctrl</kbd> to switch between major, minor, and sharp on the fly.</p>
          </section>

          <div className="wd-divider" />

          <div className="wd-two-col">
            <section className="wd-section">
              <h3 className="wd-section-title">Song sheet</h3>
              <p className="wd-prose">Click the <span className="wd-icon-ref">♪</span> icon in the header to paste a chord sheet. Two formats supported:</p>
              <ul className="wd-list">
                <li><span className="wd-badge">ChordPro</span> <code>[C]lyrics [Em]more</code></li>
                <li><span className="wd-badge">Separate lines</span> chords above lyrics</li>
              </ul>
              <p className="wd-prose">Click any chord chip on the sheet to play it instantly.</p>
            </section>

            <section className="wd-section">
              <h3 className="wd-section-title">Controls</h3>
              <ul className="wd-list wd-list--plain">
                <li><strong>Metronome</strong> — set BPM or tap tempo</li>
                <li><strong>Transpose</strong> — shift all chords ± semitones</li>
                <li><strong>Auto-scroll</strong> — scrolls the sheet while you play; adjust speed with the slider</li>
                <li><strong>Settings</strong> — 10 sound presets, visual effects, reverb &amp; sustain</li>
              </ul>
            </section>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="wd-footer">
          <button className="wd-skip-btn" onClick={onDontShowAgain}>don&apos;t show again</button>
          <button className="wd-start-btn" onClick={onDismiss}>
            Start Playing
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  )
}

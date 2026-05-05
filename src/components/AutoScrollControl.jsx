import './AutoScrollControl.css'

export default function AutoScrollControl({ active, speed, onToggle, onSpeedChange }) {
  return (
    <div className={`autoscroll-ctrl ${active ? 'active' : ''}`}>
      <button
        className="autoscroll-btn"
        onClick={onToggle}
        title={active ? 'Stop auto-scroll' : 'Auto-scroll'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {active ? (
            /* pause icon */
            <>
              <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" />
              <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" />
            </>
          ) : (
            /* scroll-down arrows */
            <>
              <polyline points="7 10 12 15 17 10" />
              <polyline points="7 5 12 10 17 5" />
            </>
          )}
        </svg>
      </button>

      <span className="autoscroll-label">SCROLL</span>

      <input
        type="range"
        min="1"
        max="10"
        step="1"
        value={speed}
        onChange={e => onSpeedChange(Number(e.target.value))}
        className="autoscroll-slider"
        title={`Speed: ${speed}`}
      />

      <span className="autoscroll-speed">{speed}</span>
    </div>
  )
}

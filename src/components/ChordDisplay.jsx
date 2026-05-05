import './ChordDisplay.css'

const pretty = s => s.replace('#', '♯')

export default function ChordDisplay({ chordName, inputBuffer, isPlaying, isHolding, chordHistory = [] }) {
  // Show all but the current (last) entry as small history items
  const prevChords = chordHistory.slice(0, -1).slice(-6)

  return (
    <div className="chord-display">
      {/* Always rendered — reserves fixed height so adding items doesn't shift layout */}
      <div className="chord-history">
        {prevChords.map((short, i) => (
          <span
            key={`${short}-${i}`}
            className="chord-history-item"
            style={{ opacity: 0.2 + (i / prevChords.length) * 0.45 }}
          >
            {pretty(short)}
          </span>
        ))}
      </div>

      <div className="chord-name-wrap">
        {chordName ? (
          <h1 className={`chord-name ${isPlaying ? 'playing' : ''}`} key={chordName}>{chordName}</h1>
        ) : (
          <p className="chord-placeholder">Press any note key to play</p>
        )}
      </div>

      <div className={`input-buffer ${inputBuffer ? 'active' : ''} ${isHolding ? 'holding' : ''}`}>
        <span className="buffer-label">{isHolding ? 'holding' : 'input'}</span>
        <span className="buffer-value">
          {inputBuffer ? pretty(inputBuffer) : '—'}
          {isHolding && <span className="hold-dot" />}
        </span>
      </div>
    </div>
  )
}

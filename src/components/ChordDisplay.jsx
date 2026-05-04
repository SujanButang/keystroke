import './ChordDisplay.css'

export default function ChordDisplay({ chordName, inputBuffer, loading, isPlaying }) {
  return (
    <div className="chord-display">
      <div className="chord-name-wrap">
        {chordName ? (
          <h1 className={`chord-name ${isPlaying ? 'playing' : ''}`} key={chordName}>{chordName}</h1>
        ) : (
          <p className="chord-placeholder">
            {loading ? 'Loading samples...' : 'Start typing a chord...'}
          </p>
        )}
      </div>

      <div className={`input-buffer ${inputBuffer ? 'active' : ''}`}>
        <span className="buffer-label">input</span>
        <span className="buffer-value">
          {inputBuffer || '—'}
          {inputBuffer && <span className="cursor-blink" />}
        </span>
      </div>
    </div>
  )
}

import { useState, useCallback, useRef } from 'react'
import { useMetronome } from '../hooks/useMetronome'
import './Metronome.css'

const MIN_BPM = 40
const MAX_BPM = 240
const BEATS = 4

export default function Metronome() {
  const [bpm, setBpm] = useState(120)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeBeat, setActiveBeat] = useState(-1)
  const tapTimesRef = useRef([])

  const { start, stop, setTempo } = useMetronome({
    onBeat: useCallback((beat) => setActiveBeat(beat), []),
  })

  function toggle() {
    if (isPlaying) {
      stop()
      setIsPlaying(false)
      setActiveBeat(-1)
    } else {
      start(bpm, BEATS)
      setIsPlaying(true)
    }
  }

  function handleBpmChange(val) {
    const clamped = Math.min(MAX_BPM, Math.max(MIN_BPM, val))
    setBpm(clamped)
    setTempo(clamped)
  }

  function handleTap() {
    const now = performance.now()
    const taps = tapTimesRef.current
    taps.push(now)
    const recent = taps.filter(t => now - t < 3000)
    tapTimesRef.current = recent
    if (recent.length >= 2) {
      const intervals = recent.slice(1).map((t, i) => t - recent[i])
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
      handleBpmChange(Math.round(60000 / avg))
    }
  }

  return (
    <div className="metronome">
      <button className="metro-play" onClick={toggle} title={isPlaying ? 'Stop' : 'Start'}>
        {isPlaying ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <rect x="5" y="4" width="4" height="16"/><rect x="15" y="4" width="4" height="16"/>
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
        )}
      </button>

      <div className="metro-beats">
        {Array.from({ length: BEATS }).map((_, i) => (
          <div
            key={i}
            className={`metro-beat ${activeBeat === i ? 'active' : ''} ${i === 0 ? 'accent-beat' : ''}`}
          />
        ))}
      </div>

      <div className="metro-bpm">
        <input
          type="number"
          min={MIN_BPM}
          max={MAX_BPM}
          value={bpm}
          onChange={e => handleBpmChange(parseInt(e.target.value) || MIN_BPM)}
          className="metro-bpm-input"
        />
        <span className="metro-bpm-label">bpm</span>
      </div>

      <input
        type="range"
        min={MIN_BPM}
        max={MAX_BPM}
        value={bpm}
        onChange={e => handleBpmChange(parseInt(e.target.value))}
        className="metro-slider"
      />

      <button className="metro-tap" onClick={handleTap}>tap</button>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import './App.css'
import Header from './components/Header'
import ChordDisplay from './components/ChordDisplay'
import VisualFeedback from './components/VisualFeedback'
import HelpPanel from './components/HelpPanel'
import SettingsPanel from './components/SettingsPanel'
import Metronome from './components/Metronome'
import TransposeControl from './components/TransposeControl'
import { useAudio } from './hooks/useAudio'

const DEFAULT_SETTINGS = {
  effect: 'ripple',
  preset: 'pad',
  sustain: 1.0,
  release: 0.8,
  reverb: 0.3,
}

const VALID_NOTES = new Set(['C', 'D', 'E', 'F', 'G', 'A', 'B'])

// Parse buffer string like "g", "gm", "c#", "c#m" → { root, isMinor } or null
function parseChord(buf) {
  const s = buf.toUpperCase()
  if (!s) return null

  let root
  let rest

  if (s.length >= 2 && s[1] === 'S') {
    root = s[0] + '#'
    rest = s.slice(2)
  } else {
    root = s[0]
    rest = s.slice(1)
  }

  if (!VALID_NOTES.has(root[0])) return null

  // Only accept '' (major) or 'M' (minor)
  if (rest !== '' && rest !== 'M') return null

  const isMinor = rest === 'M'

  const NOTE_DISPLAY = { 'C': 'C', 'C#': 'C♯', 'D': 'D', 'D#': 'D♯', 'E': 'E', 'F': 'F', 'F#': 'F♯', 'G': 'G', 'G#': 'G♯', 'A': 'A', 'A#': 'A♯', 'B': 'B' }
  const displayRoot = NOTE_DISPLAY[root] || root
  const chordName = `${displayRoot} ${isMinor ? 'minor' : 'major'}`

  return { root, isMinor, chordName }
}

export default function App() {
  const [chordName, setChordName] = useState('')
  const [inputBuffer, setInputBuffer] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [transpose, setTranspose] = useState(0)
  const [readyTonePlayed, setReadyTonePlayed] = useState(false)
  const transposeRef = useRef(0)

  useEffect(() => { transposeRef.current = transpose }, [transpose])

  const bufferRef = useRef('')
  const settingsRef = useRef(settings)

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  const { playChord, playReadyTone, loading } = useAudio()

  useEffect(() => {
    function onKeyDown(e) {
      if (e.ctrlKey || e.altKey || e.metaKey) return
      if (e.key.length > 1) return

      const char = e.key.toLowerCase()
      if (!/^[a-gms]$/.test(char)) return

      // m and s are modifiers — ignore if no note is buffered yet
      if ((char === 'm' || char === 's') && !bufferRef.current) return

      if (!readyTonePlayed) {
        playReadyTone()
        setReadyTonePlayed(true)
      }

      // Try extending the current buffer
      const newBuf = bufferRef.current + char
      const resolvedBuf = parseChord(newBuf) ? newBuf : (parseChord(char) ? char : '')

      bufferRef.current = resolvedBuf
      setInputBuffer(resolvedBuf)

      const parsed = parseChord(resolvedBuf)
      if (!parsed) return

      const { root, isMinor, chordName } = parsed
      setChordName(chordName)
      playChord(root, isMinor, { ...settingsRef.current, transpose: transposeRef.current })
      setIsPlaying(true)
      setTimeout(() => setIsPlaying(false), 100)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [playChord, playReadyTone, readyTonePlayed])

  function handleSettingChange(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="app">
      <Header
        onHelpOpen={() => setIsHelpOpen(true)}
        onSettingsOpen={() => setIsSettingsOpen(true)}
      />

      <main className="app-main">
        <VisualFeedback isPlaying={isPlaying} effect={settings.effect} />
        <ChordDisplay chordName={chordName} inputBuffer={inputBuffer} loading={loading} isPlaying={isPlaying} />
        <div className="bottom-controls">
          <Metronome />
          <div className="controls-divider" />
          <TransposeControl value={transpose} onChange={setTranspose} />
        </div>
      </main>


      <HelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onChange={handleSettingChange}
      />
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import './App.css'
import Header from './components/Header'
import ChordDisplay from './components/ChordDisplay'
import VisualFeedback from './components/VisualFeedback'
import HelpPanel from './components/HelpPanel'
import SettingsPanel from './components/SettingsPanel'
import ChordSheetPanel from './components/ChordSheetPanel'
import ChordSheetView from './components/ChordSheetView'
import Metronome from './components/Metronome'
import TransposeControl from './components/TransposeControl'
import AutoScrollControl from './components/AutoScrollControl'
import WelcomeDialog from './components/WelcomeDialog'
import { useAudio } from './hooks/useAudio'
import { parseChordSheet } from './utils/parseChordSheet'

const DEFAULT_SETTINGS = {
  effect: 'ripple',
  preset: 'pad',
  sustain: 1.0,
  release: 0.8,
  reverb: 0.3,
}

const NOTE_DISPLAY = {
  C: 'C', 'C#': 'C♯', D: 'D', 'D#': 'D♯',
  E: 'E', F: 'F', 'F#': 'F♯', G: 'G',
  'G#': 'G♯', A: 'A', 'A#': 'A♯', B: 'B',
}

// Valid sharp notes (E# and B# not used)
const VALID_SHARPS = new Set(['C', 'D', 'F', 'G', 'A'])

export default function App() {
  const [chordName, setChordName] = useState('')
  const [inputBuffer, setInputBuffer] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHolding, setIsHolding] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [transpose, setTranspose] = useState(0)
  const [readyTonePlayed, setReadyTonePlayed] = useState(false)
  const [chordHistory, setChordHistory] = useState([])
  const [showWelcome, setShowWelcome] = useState(
    () => !localStorage.getItem('keystroke-welcome-dismissed')
  )
  const [sheetText, setSheetText] = useState('')
  const [sheetSections, setSheetSections] = useState([])
  const [autoScroll, setAutoScroll] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(3)

  const settingsRef = useRef(settings)
  const transposeRef = useRef(0)
  const heldKeyRef = useRef(null)
  const heldSharpRef = useRef(false)
  const heldMinorRef = useRef(false)
  const sheetDebounceRef = useRef(null)
  const sheetAreaRef = useRef(null)
  const scrollRafRef = useRef(null)

  useEffect(() => { settingsRef.current = settings }, [settings])
  useEffect(() => { transposeRef.current = transpose }, [transpose])

  const { playChord, releaseChord, playReadyTone } = useAudio()

  useEffect(() => {
    function playHeldChord(noteChar, isSharp, isMinor, isNewNote) {
      const noteUpper = noteChar.toUpperCase()
      const root = noteUpper + (isSharp ? '#' : '')
      if (isSharp && !VALID_SHARPS.has(noteUpper)) return

      const display = NOTE_DISPLAY[root] + (isMinor ? ' minor' : ' major')
      const short = root + (isMinor ? 'm' : '')
      setChordName(display)
      setInputBuffer(short)

      if (isNewNote) {
        setChordHistory(prev => [...prev.slice(-7), short])
      } else {
        setChordHistory(prev => {
          if (prev.length === 0) return [short]
          const arr = [...prev]
          arr[arr.length - 1] = short
          return arr
        })
      }

      playChord(root, isMinor, {
        ...settingsRef.current,
        transpose: transposeRef.current,
        hold: true,
      })
      setIsPlaying(true)
      setIsHolding(true)
      setTimeout(() => setIsPlaying(false), 120)
    }

    function onKeyDown(e) {
      if (e.altKey || e.metaKey) return
      if (e.repeat) return

      // Modifier pressed while a note is held — mutate the chord live
      if ((e.key === 'Shift' || e.key === 'Control') && heldKeyRef.current) {
        if (e.key === 'Control') e.preventDefault()
        const newIsSharp = e.key === 'Control' ? true : heldSharpRef.current
        const newIsMinor = e.key === 'Shift' ? true : heldMinorRef.current
        if (newIsSharp && !VALID_SHARPS.has(heldKeyRef.current.toUpperCase())) return
        heldSharpRef.current = newIsSharp
        heldMinorRef.current = newIsMinor
        playHeldChord(heldKeyRef.current, newIsSharp, newIsMinor, false)
        return
      }

      if (e.key.length > 1) return
      const char = e.key.toLowerCase()
      if (!/^[a-g]$/.test(char)) return
      if (e.ctrlKey) e.preventDefault()

      const isSharp = e.ctrlKey
      const isMinor = e.shiftKey
      const noteUpper = char.toUpperCase()
      if (isSharp && !VALID_SHARPS.has(noteUpper)) return

      if (!readyTonePlayed) {
        playReadyTone()
        setReadyTonePlayed(true)
      }

      heldKeyRef.current = char
      heldSharpRef.current = isSharp
      heldMinorRef.current = isMinor
      playHeldChord(char, isSharp, isMinor, true)
    }

    function onKeyUp(e) {
      // Note key released — end the hold
      if (e.key.length === 1) {
        const char = e.key.toLowerCase()
        if (char !== heldKeyRef.current) return
        heldKeyRef.current = null
        heldSharpRef.current = false
        heldMinorRef.current = false
        setIsHolding(false)
        setInputBuffer('')
        releaseChord(settingsRef.current.release)
        return
      }

      // Modifier released while note is still held — revert that modifier
      if ((e.key === 'Shift' || e.key === 'Control') && heldKeyRef.current) {
        const newIsSharp = e.key === 'Control' ? false : heldSharpRef.current
        const newIsMinor = e.key === 'Shift' ? false : heldMinorRef.current
        heldSharpRef.current = newIsSharp
        heldMinorRef.current = newIsMinor
        playHeldChord(heldKeyRef.current, newIsSharp, newIsMinor, false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [playChord, releaseChord, playReadyTone, readyTonePlayed])

  // Auto-scroll via requestAnimationFrame
  useEffect(() => {
    if (!autoScroll) {
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current)
      scrollRafRef.current = null
      return
    }
    const pxPerSec = scrollSpeed * 5
    let lastTs = null
    let active = true
    function tick(ts) {
      if (!active) return
      if (lastTs !== null) {
        const el = sheetAreaRef.current
        if (el) {
          el.scrollTop += pxPerSec * (ts - lastTs) / 1000
          if (el.scrollTop >= el.scrollHeight - el.clientHeight) {
            setAutoScroll(false)
            return
          }
        }
      }
      lastTs = ts
      scrollRafRef.current = requestAnimationFrame(tick)
    }
    scrollRafRef.current = requestAnimationFrame(tick)
    return () => { active = false; if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current) }
  }, [autoScroll, scrollSpeed])

  function handleSheetTextChange(text) {
    setSheetText(text)
    setAutoScroll(false)
    if (sheetAreaRef.current) sheetAreaRef.current.scrollTop = 0
    if (sheetDebounceRef.current) clearTimeout(sheetDebounceRef.current)
    sheetDebounceRef.current = setTimeout(() => {
      setSheetSections(parseChordSheet(text))
    }, 300)
  }

  function handlePlayChord(root, isMinor) {
    if (!readyTonePlayed) {
      playReadyTone()
      setReadyTonePlayed(true)
    }
    const display = NOTE_DISPLAY[root]
      ? NOTE_DISPLAY[root] + (isMinor ? ' minor' : ' major')
      : root + (isMinor ? ' minor' : ' major')
    const short = root + (isMinor ? 'm' : '')
    setChordName(display)
    setInputBuffer(short)
    setChordHistory(prev => [...prev.slice(-7), short])
    playChord(root, isMinor, {
      ...settingsRef.current,
      transpose: transposeRef.current,
      hold: false,
    })
    setIsPlaying(true)
    setTimeout(() => setIsPlaying(false), 120)
  }

  function dismissWelcome() {
    setShowWelcome(false)
  }

  function dontShowWelcomeAgain() {
    localStorage.setItem('keystroke-welcome-dismissed', '1')
    setShowWelcome(false)
  }

  function handleSettingChange(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const hasSections = sheetSections.length > 0

  return (
    <div className="app">
      <Header
        onHelpOpen={() => setIsHelpOpen(true)}
        onSettingsOpen={() => setIsSettingsOpen(true)}
        onSheetOpen={() => setIsSheetOpen(true)}
      />

      <main className={`app-main${hasSections ? ' with-sheet' : ''}`}>
        {hasSections ? (
          <>
            {/* Compact chord bar — centered, no history */}
            <div className="app-chord-bar">
              <ChordDisplay
                chordName={chordName}
                inputBuffer={inputBuffer}
                isPlaying={isPlaying}
                isHolding={isHolding}
                chordHistory={[]}
              />
            </div>

            {/* Scrollable chord sheet */}
            <div className="app-sheet-area" ref={sheetAreaRef}>
              <ChordSheetView sections={sheetSections} onPlayChord={handlePlayChord} />
            </div>

            {/* Controls pinned at bottom */}
            <div className="app-bottom-bar">
              <div className="bottom-controls">
                <Metronome />
                <div className="controls-divider" />
                <TransposeControl value={transpose} onChange={setTranspose} />
              </div>
              <AutoScrollControl
                active={autoScroll}
                speed={scrollSpeed}
                onToggle={() => setAutoScroll(v => !v)}
                onSpeedChange={setScrollSpeed}
              />
            </div>
          </>
        ) : (
          <>
            <VisualFeedback isPlaying={isPlaying} isHolding={isHolding} effect={settings.effect} />
            <ChordDisplay
              chordName={chordName}
              inputBuffer={inputBuffer}
              isPlaying={isPlaying}
              isHolding={isHolding}
              chordHistory={chordHistory}
            />
            <div className="bottom-controls">
              <Metronome />
              <div className="controls-divider" />
              <TransposeControl value={transpose} onChange={setTranspose} />
            </div>
          </>
        )}
      </main>

      <HelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onChange={handleSettingChange}
      />
      <ChordSheetPanel
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        text={sheetText}
        onTextChange={handleSheetTextChange}
      />

      {showWelcome && <WelcomeDialog onDismiss={dismissWelcome} onDontShowAgain={dontShowWelcomeAgain} />}
    </div>
  )
}

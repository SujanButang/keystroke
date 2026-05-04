import { useRef, useCallback, useEffect } from 'react'
import { getAudioContext } from '../audio/context'

const LOOKAHEAD = 0.1     // seconds to schedule ahead
const TICK_INTERVAL = 25  // ms between scheduler ticks

function scheduleClick(ctx, time, isAccent) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.value = isAccent ? 1400 : 900

  const vol = isAccent ? 0.6 : 0.35
  gain.gain.setValueAtTime(vol, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(time)
  osc.stop(time + 0.05)
}

export function useMetronome({ onBeat } = {}) {
  const isRunningRef = useRef(false)
  const nextBeatTimeRef = useRef(0)
  const beatIndexRef = useRef(0)
  const tickerRef = useRef(null)
  const tempoRef = useRef(120)
  const beatsRef = useRef(4)
  const onBeatRef = useRef(onBeat)
  useEffect(() => { onBeatRef.current = onBeat }, [onBeat])

  const tickRef = useRef(null)
  useEffect(() => {
    tickRef.current = () => {
      const ctx = getAudioContext()
      while (nextBeatTimeRef.current < ctx.currentTime + LOOKAHEAD) {
        const beatTime = nextBeatTimeRef.current
        const beatIndex = beatIndexRef.current

        scheduleClick(ctx, beatTime, beatIndex === 0)

        const delay = (beatTime - ctx.currentTime) * 1000
        setTimeout(() => {
          if (onBeatRef.current) onBeatRef.current(beatIndex)
        }, Math.max(0, delay))

        beatIndexRef.current = (beatIndex + 1) % beatsRef.current
        nextBeatTimeRef.current += 60 / tempoRef.current
      }

      if (isRunningRef.current) {
        tickerRef.current = setTimeout(() => tickRef.current?.(), TICK_INTERVAL)
      }
    }
  })

  const tick = useCallback(() => tickRef.current?.(), [])

  const start = useCallback((bpm, beats = 4) => {
    if (isRunningRef.current) return
    tempoRef.current = bpm
    beatsRef.current = beats

    const ctx = getAudioContext()
    isRunningRef.current = true
    beatIndexRef.current = 0
    nextBeatTimeRef.current = ctx.currentTime + 0.05
    tick()
  }, [tick])

  const stop = useCallback(() => {
    isRunningRef.current = false
    if (tickerRef.current) clearTimeout(tickerRef.current)
    beatIndexRef.current = 0
  }, [])

  const setTempo = useCallback((bpm) => {
    tempoRef.current = bpm
  }, [])

  return { start, stop, setTempo }
}

import { useRef, useCallback } from 'react'
import { getAudioContext } from '../audio/context'
import { PRESETS } from '../audio/presets'

const NOTE_SEMITONES = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 }

function getChordMidi(root, isMinor, transpose = 0) {
  const rootSemi = NOTE_SEMITONES[root]
  if (rootSemi === undefined) return null
  const third = isMinor ? 3 : 4
  const rootMidi = 48 + rootSemi + transpose // C3 = 48
  return [rootMidi, rootMidi + 12 + third, rootMidi + 12 + 7]
}

const midiToFreq = midi => 440 * Math.pow(2, (midi - 69) / 12)

function buildImpulse(ctx, duration = 2, decay = 2) {
  const rate = ctx.sampleRate
  const length = rate * duration
  const impulse = ctx.createBuffer(2, length, rate)
  for (let c = 0; c < 2; c++) {
    const ch = impulse.getChannelData(c)
    for (let i = 0; i < length; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
    }
  }
  return impulse
}

export function useAudio() {
  const reverbRef = useRef(null)
  const dryGainRef = useRef(null)
  const wetGainRef = useRef(null)
  const activeGainsRef = useRef([])

  function ensureReverb() {
    const ctx = getAudioContext()
    if (reverbRef.current) return ctx

    const convolver = ctx.createConvolver()
    convolver.buffer = buildImpulse(ctx)
    reverbRef.current = convolver

    const dryGain = ctx.createGain()
    dryGain.gain.value = 1
    dryGainRef.current = dryGain

    const wetGain = ctx.createGain()
    wetGain.gain.value = 0.3
    wetGainRef.current = wetGain

    convolver.connect(wetGain)
    wetGain.connect(ctx.destination)
    dryGain.connect(ctx.destination)
    return ctx
  }

  const playReadyTone = useCallback(() => {
    const ctx = ensureReverb()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.08, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
    osc.connect(gain)
    gain.connect(dryGainRef.current)
    osc.start(now)
    osc.stop(now + 0.6)
  }, [])

  const playChord = useCallback((root, isMinor, { sustain = 1.0, release = 0.8, reverb = 0.3, transpose = 0, preset = 'pad' } = {}) => {
    const ctx = ensureReverb()
    wetGainRef.current.gain.value = reverb
    dryGainRef.current.gain.value = 1 - reverb * 0.5

    const midiNotes = getChordMidi(root, isMinor, transpose)
    if (!midiNotes) return

    const p = PRESETS[preset] ?? PRESETS.pad
    const now = ctx.currentTime

    // Fade out previous notes
    activeGainsRef.current.forEach(g => {
      g.gain.cancelScheduledValues(now)
      g.gain.setValueAtTime(g.gain.value, now)
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
    })
    activeGainsRef.current = []

    midiNotes.forEach((midi, i) => {
      const freq = midiToFreq(midi)

      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      osc1.type = p.osc1Type
      osc1.frequency.value = freq
      osc1.detune.value = -p.detune
      osc2.type = p.osc2Type
      osc2.frequency.value = freq * p.osc2FreqMult
      osc2.detune.value = +p.detune

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = p.filterFreq
      filter.Q.value = p.filterQ

      const gain = ctx.createGain()
      const vol = i === 0 ? 0.38 : 0.24

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(vol, now + p.attack)
      gain.gain.exponentialRampToValueAtTime(p.sustainLevel * vol, now + p.attack + p.decay)
      gain.gain.setValueAtTime(p.sustainLevel * vol, now + sustain)
      gain.gain.exponentialRampToValueAtTime(0.001, now + sustain + release)

      osc1.connect(filter)
      osc2.connect(filter)
      filter.connect(gain)
      gain.connect(dryGainRef.current)
      gain.connect(reverbRef.current)

      osc1.start(now); osc2.start(now)
      osc1.stop(now + sustain + release + 0.1)
      osc2.stop(now + sustain + release + 0.1)

      activeGainsRef.current.push(gain)
    })
  }, [])

  return { playChord, playReadyTone, loading: false }
}

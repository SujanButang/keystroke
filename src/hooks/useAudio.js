import { useRef, useCallback } from 'react'
import { getAudioContext } from '../audio/context'
import { PRESETS } from '../audio/presets'

const NOTE_SEMITONES = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 }

function getChordMidi(root, isMinor, transpose = 0) {
  const rootSemi = NOTE_SEMITONES[root]
  if (rootSemi === undefined) return null
  const third = isMinor ? 3 : 4
  const rootMidi = 48 + rootSemi + transpose
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
  const compressorRef = useRef(null)
  const activeGainsRef = useRef([])
  const activeOscsRef = useRef([])

  function ensureReverb() {
    const ctx = getAudioContext()
    if (reverbRef.current) return ctx

    // Limiter/compressor at the final output prevents clipping from loud presets
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -14
    compressor.knee.value = 8
    compressor.ratio.value = 5
    compressor.attack.value = 0.003
    compressor.release.value = 0.12
    compressorRef.current = compressor
    compressor.connect(ctx.destination)

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
    wetGain.connect(compressor)
    dryGain.connect(compressor)
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

  // hold=true: skip scheduled release — caller must call releaseChord()
  const playChord = useCallback((root, isMinor, {
    sustain = 1.0, release = 0.8, reverb = 0.3,
    transpose = 0, preset = 'pad', hold = false,
  } = {}) => {
    const ctx = ensureReverb()
    wetGainRef.current.gain.value = reverb
    dryGainRef.current.gain.value = 1 - reverb * 0.5

    const midiNotes = getChordMidi(root, isMinor, transpose)
    if (!midiNotes) return

    const p = PRESETS[preset] ?? PRESETS.pad
    const gainMult = p.gainMult ?? 1.0
    const now = ctx.currentTime

    // Fade out previous notes
    activeGainsRef.current.forEach(g => {
      g.gain.cancelScheduledValues(now)
      g.gain.setValueAtTime(g.gain.value, now)
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
    })
    activeOscsRef.current.forEach(o => {
      try { o.stop(now + 0.1) } catch { /* already stopped */ }
    })
    activeGainsRef.current = []
    activeOscsRef.current = []

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
      const vol = (i === 0 ? 0.38 : 0.24) * gainMult

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(vol, now + p.attack)
      gain.gain.exponentialRampToValueAtTime(p.sustainLevel * vol, now + p.attack + p.decay)

      if (!hold) {
        gain.gain.setValueAtTime(p.sustainLevel * vol, now + sustain)
        gain.gain.exponentialRampToValueAtTime(0.001, now + sustain + release)
      }

      osc1.connect(filter)
      osc2.connect(filter)
      filter.connect(gain)
      gain.connect(dryGainRef.current)
      gain.connect(reverbRef.current)

      const stopAt = hold ? now + 120 : now + sustain + release + 0.1
      osc1.start(now); osc2.start(now)
      osc1.stop(stopAt); osc2.stop(stopAt)

      activeGainsRef.current.push(gain)
      activeOscsRef.current.push(osc1, osc2)
    })
  }, [])

  // Trigger release on currently held chord
  const releaseChord = useCallback((release = 0.8) => {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    activeGainsRef.current.forEach(g => {
      g.gain.cancelScheduledValues(now)
      g.gain.setValueAtTime(g.gain.value, now)
      g.gain.exponentialRampToValueAtTime(0.001, now + release)
    })
    const oscs = activeOscsRef.current
    activeGainsRef.current = []
    activeOscsRef.current = []
    setTimeout(() => oscs.forEach(o => { try { o.stop() } catch { /* already stopped */ } }), (release + 0.1) * 1000)
  }, [])

  return { playChord, releaseChord, playReadyTone, loading: false }
}

export const PRESETS = {
  pad: {
    name: 'Warm Pad',
    osc1Type: 'sine', osc2Type: 'sine',
    detune: 6, osc2FreqMult: 1,
    filterFreq: 1100, filterQ: 0.4,
    attack: 0.025, decay: 0.4, sustainLevel: 0.38,
  },
  ePiano: {
    name: 'E. Piano',
    osc1Type: 'triangle', osc2Type: 'sine',
    detune: 3, osc2FreqMult: 1,
    filterFreq: 1800, filterQ: 0.4,
    attack: 0.008, decay: 0.5, sustainLevel: 0.18,
  },
  organ: {
    name: 'Organ',
    osc1Type: 'sine', osc2Type: 'sine',
    detune: 2, osc2FreqMult: 2,
    filterFreq: 1400, filterQ: 0.2,
    attack: 0.012, decay: 0.05, sustainLevel: 0.52,
    gainMult: 0.55, // osc2 at 2× freq doubles peak amplitude — scale down to prevent clipping
  },
  strings: {
    // sawtooth → triangle to kill the buzz
    name: 'Strings',
    osc1Type: 'triangle', osc2Type: 'triangle',
    detune: 14, osc2FreqMult: 1,
    filterFreq: 480, filterQ: 0.4,
    attack: 0.22, decay: 0.7, sustainLevel: 0.7,
  },
  bells: {
    name: 'Bells',
    osc1Type: 'sine', osc2Type: 'sine',
    detune: 1, osc2FreqMult: 1,
    filterFreq: 3200, filterQ: 0.6,
    attack: 0.004, decay: 1.0, sustainLevel: 0.05,
  },
  pluck: {
    // reduced Q from 2.0 → 0.7 to remove resonance buzz
    name: 'Pluck',
    osc1Type: 'triangle', osc2Type: 'sine',
    detune: 5, osc2FreqMult: 1,
    filterFreq: 1000, filterQ: 0.7,
    attack: 0.004, decay: 0.22, sustainLevel: 0.06,
  },
  dreamy: {
    name: 'Dreamy',
    osc1Type: 'sine', osc2Type: 'sine',
    detune: 7, osc2FreqMult: 1, // 18→7 cents: keeps gentle shimmer, avoids roughness band (7–20 Hz beating)
    filterFreq: 680, filterQ: 0.2,
    attack: 0.18, decay: 0.9, sustainLevel: 0.44,
    gainMult: 0.8,
  },
  crystal: {
    name: 'Crystal',
    osc1Type: 'sine', osc2Type: 'sine',
    detune: 2, osc2FreqMult: 1,
    filterFreq: 2400, filterQ: 0.3,
    attack: 0.008, decay: 0.9, sustainLevel: 0.1,
  },
  ambient: {
    name: 'Ambient',
    osc1Type: 'sine', osc2Type: 'sine',
    detune: 4, osc2FreqMult: 1, // 10→4 cents: slow, smooth beating avoids harsh tremolo buildup
    filterFreq: 800, filterQ: 0.15,
    attack: 0.32, decay: 1.2, sustainLevel: 0.38,
    gainMult: 0.8,
  },
  soft: {
    name: 'Soft Keys',
    osc1Type: 'sine', osc2Type: 'triangle',
    detune: 4, osc2FreqMult: 1,
    filterFreq: 1400, filterQ: 0.3,
    attack: 0.012, decay: 0.35, sustainLevel: 0.22,
  },
}

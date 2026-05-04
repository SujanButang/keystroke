import './PianoKeyboard.css'

const WW = 42    // white key width px
const BW = 26    // black key width px
const WH = 128   // white key height px
const BH = 82    // black key height px
const GAP = 2    // gap between white keys
const PITCH = WW + GAP  // distance between white key left edges

// Black key left offset within an octave (centered over the gap between whites)
const BLACK_OFFSETS = {
  'C#': PITCH * 1 - BW / 2,
  'D#': PITCH * 2 - BW / 2,
  'F#': PITCH * 4 - BW / 2,
  'G#': PITCH * 5 - BW / 2,
  'A#': PITCH * 6 - BW / 2,
}

const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const BLACK_NOTES = ['C#', 'D#', 'F#', 'G#', 'A#']

function buildKeys(startOctave, numOctaves) {
  const whites = []
  const blacks = []

  for (let i = 0; i < numOctaves; i++) {
    const oct = startOctave + i
    const octaveLeft = i * 7 * PITCH

    WHITE_NOTES.forEach((note, wi) => {
      whites.push({ note, octave: oct, left: octaveLeft + wi * PITCH })
    })

    BLACK_NOTES.forEach(note => {
      blacks.push({ note, octave: oct, left: octaveLeft + BLACK_OFFSETS[note] })
    })
  }

  // Final C
  whites.push({ note: 'C', octave: startOctave + numOctaves, left: numOctaves * 7 * PITCH })

  return { whites, blacks }
}

const { whites, blacks } = buildKeys(3, 2)
const TOTAL_WIDTH = whites.length * PITCH - GAP

export default function PianoKeyboard({ activeNotes = [] }) {
  const isActive = (note, octave) =>
    activeNotes.some(n => n.note === note && n.octave === octave)

  return (
    <div className="piano-wrapper">
      <div className="piano-keyboard" style={{ width: TOTAL_WIDTH }}>
        {whites.map((k, i) => (
          <div
            key={`w-${k.note}${k.octave}-${i}`}
            className={`piano-key white ${isActive(k.note, k.octave) ? 'active' : ''}`}
            style={{ left: k.left, width: WW, height: WH }}
          >
            <span className="key-label">{k.note}{k.octave}</span>
          </div>
        ))}
        {blacks.map((k, i) => (
          <div
            key={`b-${k.note}${k.octave}-${i}`}
            className={`piano-key black ${isActive(k.note, k.octave) ? 'active' : ''}`}
            style={{ left: k.left, width: BW, height: BH }}
          />
        ))}
      </div>
    </div>
  )
}

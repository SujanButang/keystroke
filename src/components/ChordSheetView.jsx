import { parseChordName } from '../utils/parseChordSheet'
import './ChordSheetView.css'

function ChordButton({ chord, onPlayChord }) {
  const parsed = parseChordName(chord)
  function handleClick(e) {
    e.stopPropagation()
    if (parsed && onPlayChord) onPlayChord(parsed.root, parsed.isMinor)
  }
  return (
    <button
      className={`cs-chord-btn${parsed ? '' : ' cs-chord-btn--unknown'}`}
      onClick={handleClick}
      title={parsed ? `Play ${chord}` : chord}
      type="button"
    >
      {chord}
    </button>
  )
}

function ChordLyricLine({ segments, onPlayChord }) {
  return (
    <div className="cs-line cs-line--chord-lyric">
      {segments.map((seg, i) => (
        <span key={i} className="cs-segment">
          <span className="cs-segment-chord">
            {seg.chord
              ? <ChordButton chord={seg.chord} onPlayChord={onPlayChord} />
              : <span className="cs-segment-chord-spacer" />
            }
          </span>
          <span className="cs-segment-lyric">{seg.lyric}</span>
        </span>
      ))}
    </div>
  )
}

function ChordOnlyLine({ chords, onPlayChord }) {
  return (
    <div className="cs-line cs-line--chord-only">
      {chords.map((chord, i) => (
        <ChordButton key={i} chord={chord} onPlayChord={onPlayChord} />
      ))}
    </div>
  )
}

function SheetLine({ line, onPlayChord }) {
  switch (line.type) {
    case 'chord-lyric': return <ChordLyricLine segments={line.segments} onPlayChord={onPlayChord} />
    case 'chord-only':  return <ChordOnlyLine chords={line.chords} onPlayChord={onPlayChord} />
    case 'lyric':       return <div className="cs-line cs-line--lyric">{line.text}</div>
    case 'empty':       return <div className="cs-line cs-line--empty" aria-hidden="true" />
    default:            return null
  }
}

function SheetSection({ section, onPlayChord }) {
  return (
    <div className="cs-section">
      {section.name && <div className="cs-section-header">{section.name}</div>}
      <div className="cs-section-lines">
        {section.lines.map((line, i) => (
          <SheetLine key={i} line={line} onPlayChord={onPlayChord} />
        ))}
      </div>
    </div>
  )
}

export default function ChordSheetView({ sections, onPlayChord }) {
  if (!sections || sections.length === 0) return null
  return (
    <div className="csv-root">
      {sections.map((section, i) => (
        <SheetSection key={i} section={section} onPlayChord={onPlayChord} />
      ))}
    </div>
  )
}

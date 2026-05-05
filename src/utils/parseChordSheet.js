/**
 * parseChordSheet.js
 * Parses chord sheet text in two formats:
 *   1. ChordPro inline:  [C]Utha na garau [Em]kaani
 *   2. Separate lines:   chord line above lyric line (positional)
 *
 * Both formats may contain section headers like [Verse 1], [Chorus].
 */

// ---------------------------------------------------------------------------
// Chord validation
// ---------------------------------------------------------------------------

// Enharmonic flat → sharp normalisation map
const FLAT_MAP = {
  Bb: 'A#', Eb: 'D#', Ab: 'G#', Db: 'C#', Gb: 'F#',
}

const NOTE_SEMITONES = {
  C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4,
  F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11,
}

// Matches a full chord token (root + optional quality suffix).
// This is deliberately permissive for the chord-line detector; fine details
// (7, maj7, sus4, dim, aug, add9, 11, 13 …) are stripped in parseChordName.
const CHORD_TOKEN_RE = /^[A-G][#b]?(m|maj|min|dim|aug|sus[24]?|add\d+|maj7|m7|7|9|11|13)?$/

/**
 * Returns true if the token looks like a chord name.
 */
function isChordToken(token) {
  return CHORD_TOKEN_RE.test(token)
}

/**
 * Returns true when every whitespace-separated token on the line is a
 * valid chord name (and the line is non-empty).
 */
function isChordLine(line) {
  const tokens = line.trim().split(/\s+/)
  return tokens.length > 0 && tokens.every(isChordToken)
}

/**
 * Returns true when the line is a section header:
 *   – matches /^\[.+\]$/
 *   – AND the bracketed content is NOT a valid chord by itself
 *     (e.g. `[C]` alone is a chord, `[Verse 1]` is a header)
 */
function isSectionHeader(line) {
  const trimmed = line.trim()
  if (!/^\[.+\]$/.test(trimmed)) return false
  const inner = trimmed.slice(1, -1)
  return !isChordToken(inner)
}

// ---------------------------------------------------------------------------
// parseChordName
// ---------------------------------------------------------------------------

/**
 * Parses a chord name and returns { root, isMinor } or null on failure.
 * Root is normalised to the NOTE_SEMITONES key set (sharps only, no flats).
 * Quality suffixes (7, maj7, sus, dim, aug, add*, 9, 11, 13) are stripped,
 * but 'm' / 'min' prefix is preserved to identify minor chords.
 */
export function parseChordName(name) {
  if (!name || typeof name !== 'string') return null

  // Strip outer brackets if present (inline [C] style)
  let s = name.trim().replace(/^\[/, '').replace(/\]$/, '')

  if (!s) return null

  // Extract root note (letter + optional accidental)
  const rootMatch = s.match(/^([A-G][#b]?)/)
  if (!rootMatch) return null

  let root = rootMatch[1]
  const quality = s.slice(root.length) // everything after the root

  // Normalise flat → sharp
  if (FLAT_MAP[root]) root = FLAT_MAP[root]

  // Must be a known root after normalisation
  if (!(root in NOTE_SEMITONES)) return null

  // Determine minor: quality starts with 'm' but NOT 'maj'
  const isMinor = /^m(?!aj)/.test(quality)

  return { root, isMinor }
}

// ---------------------------------------------------------------------------
// ChordPro inline parser
// ---------------------------------------------------------------------------

/**
 * Parses a ChordPro inline line such as:
 *   "[C]Utha na garau [Em]kaani"
 *
 * Returns an array of segments: [{ chord, lyric }, …]
 * where chord may be '' for leading lyric text before the first chord.
 */
function parseInlineLine(line) {
  // Matches [ChordToken] possibly followed by lyric text
  const pattern = /\[([A-G][#b]?(?:m|maj|min|dim|aug|sus[24]?|add\d+|maj7|m7|7|9|11|13)?)\]([^[]*)/g
  const segments = []
  let lastIndex = 0
  let match

  while ((match = pattern.exec(line)) !== null) {
    // Text before the first chord tag (no chord label)
    if (match.index > lastIndex) {
      const leadingLyric = line.slice(lastIndex, match.index)
      if (leadingLyric) {
        segments.push({ chord: '', lyric: leadingLyric })
      }
    }
    segments.push({ chord: match[1], lyric: match[2] })
    lastIndex = match.index + match[0].length
  }

  // Any trailing text (shouldn't normally occur, but handle it)
  if (lastIndex < line.length) {
    const trailing = line.slice(lastIndex)
    if (trailing.trim()) {
      segments.push({ chord: '', lyric: trailing })
    }
  }

  return segments
}

/**
 * Returns true when the line contains at least one [ChordToken] pattern
 * (i.e. it is an inline ChordPro line, not a plain section header).
 */
function isInlineLine(line) {
  return /\[[A-G][#b]?(?:m|maj|min|dim|aug|sus[24]?|add\d+|maj7|m7|7|9|11|13)?\]/.test(line)
}

// ---------------------------------------------------------------------------
// Separate-line (positional) pairing
// ---------------------------------------------------------------------------

/**
 * Given a chord line (e.g. "C           Em     F")
 * and a lyric line (e.g. "Utha na garau kaani kura"),
 * returns an array of segments based on the character positions of each chord.
 *
 * Each segment: { chord, lyric } where lyric is the slice of the lyric line
 * that starts at the chord's position and ends just before the next chord.
 */
function pairChordLyric(chordLine, lyricLine) {
  // Find every chord token and its start position
  const chordPositions = []
  const tokenRe = /([A-G][#b]?(?:m|maj|min|dim|aug|sus[24]?|add\d+|maj7|m7|7|9|11|13)?)/g
  let m
  while ((m = tokenRe.exec(chordLine)) !== null) {
    chordPositions.push({ chord: m[1], pos: m.index })
  }

  if (chordPositions.length === 0) return []

  const segments = []
  for (let i = 0; i < chordPositions.length; i++) {
    const { chord, pos } = chordPositions[i]
    const nextPos = i + 1 < chordPositions.length ? chordPositions[i + 1].pos : lyricLine.length
    // Slice lyric from this chord's position to the next chord's position.
    // Clamp to actual lyric length; pad with spaces if lyric is shorter.
    const lyricSlice = lyricLine.slice(pos, nextPos)
    segments.push({ chord, lyric: lyricSlice })
  }

  // If lyric starts before the first chord position, prepend a no-chord segment
  if (chordPositions[0].pos > 0) {
    const leadingLyric = lyricLine.slice(0, chordPositions[0].pos)
    if (leadingLyric.trim()) {
      segments.unshift({ chord: '', lyric: leadingLyric })
    }
  }

  return segments
}

// ---------------------------------------------------------------------------
// Main parser
// ---------------------------------------------------------------------------

/**
 * Parses a full chord sheet string and returns an array of sections:
 *
 * [
 *   {
 *     name: 'Verse 1',   // empty string if no preceding header
 *     lines: [
 *       { type: 'chord-lyric', segments: [{ chord, lyric }, …] },
 *       { type: 'lyric',       text: '…' },
 *       { type: 'chord-only',  chords: ['C', 'Em'] },
 *       { type: 'empty' },
 *     ]
 *   },
 *   …
 * ]
 */
export function parseChordSheet(text) {
  if (!text || typeof text !== 'string') return []

  const rawLines = text.split('\n')
  const sections = []

  let currentSection = { name: '', lines: [] }

  // We process lines with look-ahead for the separate-line format.
  let i = 0
  while (i < rawLines.length) {
    const raw = rawLines[i]
    const line = raw  // preserve original spacing for positional matching

    // --- Section header ---
    if (isSectionHeader(line)) {
      // Push the current section if it has content
      if (currentSection.lines.length > 0 || currentSection.name) {
        sections.push(currentSection)
      }
      currentSection = { name: line.trim().slice(1, -1), lines: [] }
      i++
      continue
    }

    // --- Empty line ---
    if (line.trim() === '') {
      currentSection.lines.push({ type: 'empty' })
      i++
      continue
    }

    // --- ChordPro inline line ---
    if (isInlineLine(line)) {
      const segments = parseInlineLine(line)
      currentSection.lines.push({ type: 'chord-lyric', segments })
      i++
      continue
    }

    // --- Chord-only line (separate-line format) ---
    if (isChordLine(line)) {
      // Look ahead: if the very next line is a non-empty, non-chord, non-header
      // line, pair them together as a chord-lyric line.
      const nextRaw = rawLines[i + 1]
      if (
        nextRaw !== undefined &&
        nextRaw.trim() !== '' &&
        !isChordLine(nextRaw) &&
        !isSectionHeader(nextRaw) &&
        !isInlineLine(nextRaw)
      ) {
        const segments = pairChordLyric(line, nextRaw)
        if (segments.length > 0) {
          currentSection.lines.push({ type: 'chord-lyric', segments })
          i += 2 // consume both the chord line and the lyric line
          continue
        }
      }

      // No following lyric line — emit as chord-only
      const chords = line.trim().split(/\s+/).filter(Boolean)
      currentSection.lines.push({ type: 'chord-only', chords })
      i++
      continue
    }

    // --- Plain lyric line ---
    currentSection.lines.push({ type: 'lyric', text: line })
    i++
  }

  // Push the last section
  if (currentSection.lines.length > 0 || currentSection.name) {
    sections.push(currentSection)
  }

  // If no sections were found at all, return an empty array rather than
  // a single unnamed section with no lines.
  if (sections.length === 1 && !sections[0].name && sections[0].lines.length === 0) {
    return []
  }

  return sections
}

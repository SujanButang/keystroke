# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**KeyStroke** — a browser-based chord player. Type a chord name (e.g. `g`, `gm`, `c#`, `c#m`) and it plays the corresponding piano chord using the Web Audio API. Planned future features include multiple instruments and a song chord library.

## Commands

```bash
npm run dev       # start dev server (Vite HMR)
npm run build     # production build
npm run preview   # preview production build locally
npm run lint      # ESLint
```

## Stack

- **React 19** + **Vite 8** (ES modules, no CRA)
- **Web Audio API** for sound synthesis — no audio libraries
- No UI component library; styles are plain CSS with CSS variables

## Architecture

The app is being built from a fresh Vite scaffold. The intended structure:

- `src/App.jsx` — root layout and top-level state (chord name, input buffer, panel toggles, audio/visual settings)
- `src/components/` — individual UI components (Header, ChordDisplay, PianoKeyboard, HelpPanel, SettingsPanel, VisualFeedback)
- `src/index.css` — global CSS variables and base styles (dark theme)
- `src/App.css` — layout-level styles

Audio logic (Web Audio API context, oscillators, envelope, reverb) will live in a custom hook or utility module, not inline in components.

## Input System

Chord input uses a keystroke buffer with a 400ms debounce timeout. Valid inputs:
- `[note]` → major chord (e.g. `g`)
- `[note]m` → minor chord (e.g. `gm`)
- `[note]s` → sharp major (e.g. `cs`)
- `[note]sm` → sharp minor (e.g. `csm`)

Notes: C, D, E, F, G, A, B (case-insensitive). Keypresses with modifier keys (ctrl/alt/cmd) are ignored.

// Shared AudioContext singleton — both chord player and metronome use this
let ctx = null

export function getAudioContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

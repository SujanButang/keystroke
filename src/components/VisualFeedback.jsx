import { useEffect, useRef } from 'react'
import './VisualFeedback.css'

export default function VisualFeedback({ isPlaying, isHolding, effect }) {
  const rippleRef = useRef(null)
  const particlesRef = useRef(null)
  const particlesTimerRef = useRef(null)

  // Ripple & particles: trigger on play, let the animation run to full completion
  // (same class-toggle + reflow trick so removing isPlaying doesn't cut it short)
  useEffect(() => {
    if (!isPlaying) return

    if (effect === 'ripple' && rippleRef.current) {
      rippleRef.current.classList.remove('animate')
      void rippleRef.current.offsetWidth
      rippleRef.current.classList.add('animate')
    }

    if (effect === 'particles' && particlesRef.current) {
      particlesRef.current.classList.remove('burst')
      void particlesRef.current.offsetWidth
      particlesRef.current.classList.add('burst')
      clearTimeout(particlesTimerRef.current)
      particlesTimerRef.current = setTimeout(() => {
        if (particlesRef.current) particlesRef.current.classList.remove('burst')
      }, 1000)
    }
  }, [isPlaying, effect])

  // Bars stay active the whole time a chord is held, not just 120 ms
  const barsActive = isPlaying || isHolding

  return (
    <div className="visual-feedback">
      {effect === 'ripple' && (
        <div className="ripple-container" ref={rippleRef}>
          <div className="ripple r1" />
          <div className="ripple r2" />
          <div className="ripple r3" />
        </div>
      )}

      {effect === 'bars' && (
        <div className={`bars-container ${barsActive ? 'playing' : ''}`}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bar" style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
      )}

      {effect === 'particles' && (
        <div className="particles-container" ref={particlesRef}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="particle" />
          ))}
        </div>
      )}
    </div>
  )
}

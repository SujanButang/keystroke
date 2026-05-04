import { useEffect, useRef } from 'react'
import './VisualFeedback.css'

export default function VisualFeedback({ isPlaying, effect }) {
  const rippleRef = useRef(null)

  useEffect(() => {
    if (isPlaying && effect === 'ripple' && rippleRef.current) {
      rippleRef.current.classList.remove('animate')
      void rippleRef.current.offsetWidth
      rippleRef.current.classList.add('animate')
    }
  }, [isPlaying, effect])

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
        <div className={`bars-container ${isPlaying ? 'playing' : ''}`}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bar" style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
      )}

      {effect === 'particles' && (
        <div className={`particles-container ${isPlaying ? 'burst' : ''}`}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="particle" style={{ '--i': i }} />
          ))}
        </div>
      )}
    </div>
  )
}

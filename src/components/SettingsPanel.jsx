import './SettingsPanel.css'
import { PRESETS } from '../audio/presets'

const EFFECTS = [
  { id: 'ripple', label: 'Ripple', desc: 'Expanding rings' },
  { id: 'bars', label: 'Wave Bars', desc: 'Equalizer bars' },
  { id: 'particles', label: 'Particles', desc: 'Floating dots' },
]

export default function SettingsPanel({ isOpen, onClose, settings, onChange }) {
  return (
    <>
      <div className={`panel-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`settings-panel ${isOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <h2>Settings</h2>
          <button className="panel-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <section className="settings-section">
          <h3>Visual Effect</h3>
          <div className="effect-options">
            {EFFECTS.map(({ id, label, desc }) => (
              <button
                key={id}
                className={`effect-option ${settings.effect === id ? 'selected' : ''}`}
                onClick={() => onChange('effect', id)}
              >
                <span className="effect-label">{label}</span>
                <span className="effect-desc">{desc}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <h3>Sound Preset</h3>
          <div className="effect-options">
            {Object.entries(PRESETS).map(([id, { name }]) => (
              <button
                key={id}
                className={`effect-option ${settings.preset === id ? 'selected' : ''}`}
                onClick={() => onChange('preset', id)}
              >
                <span className="effect-label">{name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <h3>Audio</h3>

          <div className="setting-row">
            <label>
              <span>Sustain</span>
              <span className="setting-value">{settings.sustain}s</span>
            </label>
            <input
              type="range" min="0.2" max="10" step="0.1"
              value={settings.sustain}
              onChange={e => onChange('sustain', parseFloat(e.target.value))}
            />
          </div>

          <div className="setting-row">
            <label>
              <span>Release</span>
              <span className="setting-value">{settings.release}s</span>
            </label>
            <input
              type="range" min="0.1" max="3" step="0.1"
              value={settings.release}
              onChange={e => onChange('release', parseFloat(e.target.value))}
            />
          </div>

          <div className="setting-row">
            <label>
              <span>Reverb</span>
              <span className="setting-value">{Math.round(settings.reverb * 100)}%</span>
            </label>
            <input
              type="range" min="0" max="1" step="0.05"
              value={settings.reverb}
              onChange={e => onChange('reverb', parseFloat(e.target.value))}
            />
          </div>
        </section>
      </aside>
    </>
  )
}

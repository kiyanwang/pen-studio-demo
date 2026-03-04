import { useStore } from '../store/useStore';

export default function ControlBar() {
  const lathe = useStore((s) => s.lathe);
  const toggleLathe = useStore((s) => s.toggleLathe);
  const setLatheSpeed = useStore((s) => s.setLatheSpeed);
  const resetBlank = useStore((s) => s.resetBlank);
  const undo = useStore((s) => s.undo);

  const speedProgress = ((lathe.speed - 500) / (4000 - 500)) * 100;

  return (
    <div className="panel animate-in animate-in-delay-3" style={barStyle}>
      {/* Play/Pause */}
      <button
        className="btn-icon"
        onClick={toggleLathe}
        title={lathe.spinning ? 'Pause lathe (Space)' : 'Start lathe (Space)'}
        style={{
          width: 44,
          height: 44,
          background: lathe.spinning
            ? 'rgba(193, 127, 62, 0.2)'
            : 'rgba(255, 255, 255, 0.04)',
          borderColor: lathe.spinning ? 'var(--accent-warm)' : 'var(--border-subtle)',
          boxShadow: lathe.spinning ? '0 0 18px rgba(193, 127, 62, 0.15)' : 'none',
        }}
      >
        {lathe.spinning ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="3" y="2" width="4" height="14" rx="1" fill="var(--accent-glow)" />
            <rect x="11" y="2" width="4" height="14" rx="1" fill="var(--accent-glow)" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 2 L16 9 L4 16Z" fill="var(--accent-glow)" />
          </svg>
        )}
      </button>

      {/* Divider */}
      <div style={dividerStyle} />

      {/* Speed Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={labelStyle}>RPM</span>
        <input
          type="range"
          min={500}
          max={4000}
          step={100}
          value={lathe.speed}
          onChange={(e) => setLatheSpeed(Number(e.target.value))}
          style={{
            width: 120,
            ['--range-progress' as string]: `${speedProgress}%`,
          }}
        />
        <span style={rpmValueStyle}>{lathe.speed}</span>
      </div>

      {/* Divider */}
      <div style={dividerStyle} />

      {/* Undo */}
      <button
        className="btn-icon"
        onClick={undo}
        title="Undo (Ctrl+Z)"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 7 L6 4 M3 7 L6 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 7 H10 C12.2 7, 14 8.8, 14 11 C14 13.2, 12.2 15, 10 15 H8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </button>

      {/* Reset */}
      <button
        className="btn-icon"
        onClick={resetBlank}
        title="Reset blank (R)"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 8 A6 6 0 1 1 4.3 12.7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M2 4 L2 8 L6 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>
    </div>
  );
}

const barStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 18px',
  zIndex: 10,
};

const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 28,
  background: 'var(--border-subtle)',
  flexShrink: 0,
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--text-muted)',
};

const rpmValueStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
  color: 'var(--accent-glow)',
  minWidth: 36,
  textAlign: 'right',
};

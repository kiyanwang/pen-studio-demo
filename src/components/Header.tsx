import { useEffect, useState } from 'react';

const headerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 20,
  left: 24,
  zIndex: 10,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  userSelect: 'none',
};

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 26,
  fontWeight: 700,
  letterSpacing: '0.02em',
  color: 'var(--text-primary)',
  margin: 0,
  lineHeight: 1.1,
  textShadow: '0 2px 12px rgba(0,0,0,0.5)',
};

const accentStyle: React.CSSProperties = {
  color: 'var(--accent-glow)',
};

const taglineStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 11,
  fontWeight: 300,
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  color: 'var(--text-muted)',
  margin: 0,
  paddingLeft: 2,
};

export default function Header() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        ...headerStyle,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-8px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      <h1 style={titleStyle}>
        Pen<span style={accentStyle}>Craft</span> Studio
      </h1>
      <p style={taglineStyle}>Virtual Pen Turning Simulator</p>
    </div>
  );
}

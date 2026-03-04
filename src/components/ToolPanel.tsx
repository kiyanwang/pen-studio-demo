import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { ToolType } from '../types';

const TOOL_SHORTCUTS: Record<ToolType, string> = {
  'roughing-gouge': '1',
  'spindle-gouge': '2',
  'skew-chisel': '3',
  'parting-tool': '4',
  'scraper': '5',
};

function ToolIcon({ type, active }: { type: ToolType; active: boolean }) {
  const color = active ? 'var(--accent-glow)' : 'var(--text-secondary)';
  const w = 32;
  const h = 32;

  switch (type) {
    case 'roughing-gouge':
      return (
        <svg width={w} height={h} viewBox="0 0 32 32" fill="none">
          <path
            d="M6 22 C6 14, 16 8, 26 8"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M6 22 L4 26"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <ellipse cx="26" cy="8" rx="2" ry="3" fill={color} opacity={0.3} />
        </svg>
      );
    case 'spindle-gouge':
      return (
        <svg width={w} height={h} viewBox="0 0 32 32" fill="none">
          <path
            d="M8 24 C10 18, 14 12, 24 10"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M8 24 L6 27"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <ellipse cx="24" cy="10" rx="1.5" ry="2.5" fill={color} opacity={0.3} />
        </svg>
      );
    case 'skew-chisel':
      return (
        <svg width={w} height={h} viewBox="0 0 32 32" fill="none">
          <line x1="6" y1="26" x2="22" y2="6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="22" y1="6" x2="28" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="6" y1="26" x2="4" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'parting-tool':
      return (
        <svg width={w} height={h} viewBox="0 0 32 32" fill="none">
          <rect x="14" y="6" width="4" height="18" rx="0.5" fill={color} opacity={0.25} stroke={color} strokeWidth="1.5" />
          <line x1="16" y1="24" x2="16" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'scraper':
      return (
        <svg width={w} height={h} viewBox="0 0 32 32" fill="none">
          <path
            d="M6 16 Q6 10, 16 10 Q26 10, 26 16"
            stroke={color}
            strokeWidth="2"
            fill={color}
            fillOpacity={0.12}
            strokeLinecap="round"
          />
          <line x1="16" y1="16" x2="16" y2="26" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

export default function ToolPanel() {
  const tools = useStore((s) => s.tools);
  const activeTool = useStore((s) => s.activeTool);
  const setActiveTool = useStore((s) => s.setActiveTool);
  const [hoveredTool, setHoveredTool] = useState<ToolType | null>(null);

  return (
    <div className="panel animate-in animate-in-delay-1" style={panelStyle}>
      <div className="panel-title">Tools</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {tools.map((tool) => {
          const isActive = activeTool === tool.type;
          const isHovered = hoveredTool === tool.type;
          return (
            <div key={tool.type} style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveTool(tool.type)}
                onMouseEnter={() => setHoveredTool(tool.type)}
                onMouseLeave={() => setHoveredTool(null)}
                style={{
                  ...toolBtnStyle,
                  background: isActive
                    ? 'rgba(193, 127, 62, 0.15)'
                    : isHovered
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'transparent',
                  borderColor: isActive
                    ? 'var(--accent-warm)'
                    : 'transparent',
                  boxShadow: isActive
                    ? '0 0 20px rgba(193, 127, 62, 0.12), inset 0 0 12px rgba(193, 127, 62, 0.06)'
                    : 'none',
                }}
              >
                <ToolIcon type={tool.type} active={isActive} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? 'var(--accent-glow)' : 'var(--text-primary)',
                      lineHeight: 1.2,
                      transition: 'color 0.15s ease',
                    }}
                  >
                    {tool.displayName}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                    Width: {(tool.cutWidth * 100).toFixed(0)}
                  </div>
                </div>
                <kbd style={kbdStyle}>{TOOL_SHORTCUTS[tool.type]}</kbd>
              </button>

              {/* Tooltip */}
              {isHovered && (
                <div
                  className="tooltip"
                  style={{ left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 10 }}
                >
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3 }}>
                    {tool.displayName}
                  </div>
                  <div>{tool.description}</div>
                  <div style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: 11 }}>
                    Cut: {tool.profileShape} | Depth: {(tool.cutDepth * 100).toFixed(1)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 72,
  left: 20,
  width: 200,
  padding: 'var(--panel-padding)',
  zIndex: 10,
};

const toolBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid transparent',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  textAlign: 'left',
};

const kbdStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 10,
  fontWeight: 500,
  color: 'var(--text-muted)',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 4,
  padding: '2px 6px',
  lineHeight: 1,
  flexShrink: 0,
};

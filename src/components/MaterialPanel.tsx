import { useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import type { WoodSpecies, BlankMaterial } from '../types';

type MaterialTab = 'wood' | 'resin';

/** Convert RGB float [0-1] array to hex CSS color */
function rgbToHex(rgb: [number, number, number]): string {
  return (
    '#' +
    rgb
      .map((c) =>
        Math.round(Math.min(1, Math.max(0, c)) * 255)
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  );
}

/** Convert HSL values to RGB [0-1] array */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

/** Approximate RGB [0-1] to HSL */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

const WOOD_ORDER: WoodSpecies[] = [
  'oak', 'walnut', 'maple', 'cherry', 'ebony',
  'padauk', 'purpleheart', 'cocobolo', 'olivewood', 'bocote',
];

export default function MaterialPanel() {
  const blank = useStore((s) => s.blank);
  const woodPresets = useStore((s) => s.woodPresets);
  const setWoodSpecies = useStore((s) => s.setWoodSpecies);
  const setMaterial = useStore((s) => s.setMaterial);
  const setResinColor = useStore((s) => s.setResinColor);

  const [tab, setTab] = useState<MaterialTab>(blank.material === 'resin' ? 'resin' : 'wood');

  const resinRgb = blank.resinConfig?.color ?? [0.1, 0.4, 0.7];
  const [resinH, resinS, resinL] = rgbToHsl(...resinRgb);

  const handleTabChange = useCallback(
    (newTab: MaterialTab) => {
      setTab(newTab);
      const mat: BlankMaterial = newTab === 'wood' ? 'wood' : 'resin';
      setMaterial(mat);
    },
    [setMaterial]
  );

  const handleHslChange = useCallback(
    (h: number, s: number, l: number) => {
      setResinColor(hslToRgb(h, s, l));
    },
    [setResinColor]
  );

  return (
    <div className="panel animate-in animate-in-delay-2" style={panelStyle}>
      <div className="panel-title">Material</div>

      {/* Tabs */}
      <div style={tabBarStyle}>
        {(['wood', 'resin'] as MaterialTab[]).map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            style={{
              ...tabStyle,
              color: tab === t ? 'var(--accent-glow)' : 'var(--text-secondary)',
              borderBottomColor: tab === t ? 'var(--accent-warm)' : 'transparent',
              fontWeight: tab === t ? 600 : 400,
            }}
          >
            {t === 'wood' ? 'Wood' : 'Resin'}
          </button>
        ))}
      </div>

      {/* Wood Tab */}
      {tab === 'wood' && (
        <div style={gridStyle}>
          {WOOD_ORDER.map((species) => {
            const wood = woodPresets[species];
            const isSelected = blank.material === 'wood' && blank.woodConfig?.species === species;
            return (
              <button
                key={species}
                onClick={() => setWoodSpecies(species)}
                style={swatchBtnStyle}
                title={wood.displayName}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: `radial-gradient(circle at 35% 35%, ${rgbToHex(wood.baseColor)}, ${rgbToHex(wood.grainColor)})`,
                    border: isSelected
                      ? '2.5px solid var(--accent-glow)'
                      : '2px solid rgba(255,255,255,0.06)',
                    boxShadow: isSelected
                      ? '0 0 14px rgba(232, 168, 76, 0.35), 0 0 4px rgba(232, 168, 76, 0.2)'
                      : '0 2px 8px rgba(0,0,0,0.3)',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    lineHeight: 1.2,
                    color: isSelected ? 'var(--accent-glow)' : 'var(--text-secondary)',
                    textAlign: 'center',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {wood.displayName}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Resin Tab */}
      {tab === 'resin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
          {/* Preview */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: rgbToHex(resinRgb),
                border: '2.5px solid var(--accent-warm)',
                boxShadow: `0 0 20px ${rgbToHex(resinRgb)}44, 0 4px 12px rgba(0,0,0,0.4)`,
                opacity: blank.resinConfig?.opacity ?? 0.85,
              }}
            />
          </div>

          {/* Hue */}
          <SliderRow
            label="Hue"
            value={resinH}
            min={0}
            max={360}
            trackBg="linear-gradient(90deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
            onChange={(v) => handleHslChange(v, resinS, resinL)}
          />

          {/* Saturation */}
          <SliderRow
            label="Saturation"
            value={resinS}
            min={0}
            max={100}
            trackBg={`linear-gradient(90deg, hsl(${resinH},0%,${resinL}%), hsl(${resinH},100%,${resinL}%))`}
            onChange={(v) => handleHslChange(resinH, v, resinL)}
          />

          {/* Lightness */}
          <SliderRow
            label="Lightness"
            value={resinL}
            min={0}
            max={100}
            trackBg={`linear-gradient(90deg, hsl(${resinH},${resinS}%,0%), hsl(${resinH},${resinS}%,50%), hsl(${resinH},${resinS}%,100%))`}
            onChange={(v) => handleHslChange(resinH, resinS, v)}
          />

          {/* Shimmer toggle */}
          <label style={toggleRowStyle}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Shimmer</span>
            <div
              style={{
                ...toggleTrackStyle,
                background: blank.resinConfig?.shimmer
                  ? 'var(--accent-warm)'
                  : 'rgba(255,255,255,0.08)',
              }}
              onClick={() => {
                const rc = blank.resinConfig;
                if (rc) {
                  useStore.setState((s) => ({
                    blank: {
                      ...s.blank,
                      resinConfig: { ...rc, shimmer: !rc.shimmer },
                    },
                  }));
                }
              }}
            >
              <div
                style={{
                  ...toggleThumbStyle,
                  transform: blank.resinConfig?.shimmer ? 'translateX(16px)' : 'translateX(0)',
                }}
              />
            </div>
          </label>
        </div>
      )}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  trackBg,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  trackBg: string;
  onChange: (v: number) => void;
}) {
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          ['--range-progress' as string]: `${progress}%`,
        }}
      />
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 72,
  right: 20,
  width: 210,
  padding: 'var(--panel-padding)',
  zIndex: 10,
};

const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: 0,
  marginBottom: 12,
};

const tabStyle: React.CSSProperties = {
  flex: 1,
  padding: '6px 0',
  fontSize: 12,
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  background: 'none',
  border: 'none',
  borderBottom: '2px solid transparent',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 6,
};

const swatchBtnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 5,
  padding: '8px 4px',
  borderRadius: 8,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  transition: 'background 0.15s ease',
};

const toggleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
};

const toggleTrackStyle: React.CSSProperties = {
  width: 36,
  height: 20,
  borderRadius: 10,
  padding: 2,
  cursor: 'pointer',
  transition: 'background 0.2s ease',
};

const toggleThumbStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  borderRadius: '50%',
  background: 'var(--text-primary)',
  transition: 'transform 0.2s ease',
  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
};

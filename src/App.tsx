import { useEffect, lazy, Suspense } from 'react';
import { useStore } from './store/useStore';
import Header from './components/Header';
import ToolPanel from './components/ToolPanel';
import MaterialPanel from './components/MaterialPanel';
import ControlBar from './components/ControlBar';
import type { ToolType } from './types';

const LatheScene = lazy(() =>
  import('./components/LatheScene').then((m) => ({ default: m.LatheScene }))
);

const TOOL_KEYS: Record<string, ToolType> = {
  '1': 'roughing-gouge',
  '2': 'spindle-gouge',
  '3': 'skew-chisel',
  '4': 'parting-tool',
  '5': 'scraper',
};

function CanvasPlaceholder() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, #2a2118 0%, var(--bg-dark) 70%)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          color: 'var(--text-muted)',
          letterSpacing: '0.05em',
        }}
      >
        Loading workshop...
      </div>
    </div>
  );
}

export default function App() {
  const setActiveTool = useStore((s) => s.setActiveTool);
  const toggleLathe = useStore((s) => s.toggleLathe);
  const resetBlank = useStore((s) => s.resetBlank);
  const undo = useStore((s) => s.undo);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Tool selection: 1-5
      if (TOOL_KEYS[e.key]) {
        e.preventDefault();
        setActiveTool(TOOL_KEYS[e.key]);
        return;
      }

      // Space: toggle lathe
      if (e.code === 'Space') {
        e.preventDefault();
        toggleLathe();
        return;
      }

      // R: reset blank
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        resetBlank();
        return;
      }

      // Ctrl+Z / Cmd+Z: undo
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        undo();
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, toggleLathe, resetBlank, undo]);

  return (
    <div style={appStyle}>
      {/* 3D Canvas */}
      <div style={canvasContainerStyle}>
        <Suspense fallback={<CanvasPlaceholder />}>
          <LatheScene />
        </Suspense>
      </div>

      {/* Floating UI Overlay */}
      <Header />
      <ToolPanel />
      <MaterialPanel />
      <ControlBar />
    </div>
  );
}

const appStyle: React.CSSProperties = {
  position: 'relative',
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  background: 'var(--bg-dark)',
};

const canvasContainerStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 0,
};

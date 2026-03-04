# PenCraft Studio

A 3D pen turning simulator that lets you shape virtual pen blanks on a lathe, choose from 10 real wood species with procedural grain shaders, and see your design take shape in real time.

Built with React, TypeScript, Three.js, and procedural GLSL shaders.

## Features

- **Interactive lathe simulation** — click and drag tools along a spinning blank to cut material away and shape your pen
- **10 wood species** with realistic procedural grain patterns — Oak, Walnut, Maple, Cherry, Ebony, Padauk, Purpleheart, Cocobolo, Olive Wood, Bocote
- **Resin material** with translucency, color picker, and shimmer effects
- **5 turning tools** — Roughing Gouge, Spindle Gouge, Skew Chisel, Parting Tool, Round Scraper — each with distinct cut width and depth
- **3D lathe model** with headstock, tailstock, tool rest, and bed
- **Orbit, pan, and zoom** the camera to inspect your work from any angle
- **Undo and reset** to iterate on your design
- **Workshop-themed UI** with floating glass-morphism panels, warm amber palette, and craftsman typography

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (included with Node.js)

### Installation

```bash
git clone https://github.com/kiyanwang/pen-studio-demo.git
cd pen-studio-demo
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The page hot-reloads as you make changes.

### Production Build

```bash
npm run build
```

Output is written to the `dist/` directory. Preview it locally with:

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Controls

| Input | Action |
|-------|--------|
| **Click + drag on blank** | Cut material with the active tool |
| **Left-click + drag (off blank)** | Orbit the camera |
| **Right-click + drag** | Pan the camera |
| **Scroll wheel** | Zoom in/out |
| **1 – 5** | Select tool (Roughing Gouge, Spindle Gouge, Skew Chisel, Parting Tool, Scraper) |
| **Space** | Toggle lathe on/off |
| **R** | Reset blank to original cylinder |
| **Ctrl+Z / Cmd+Z** | Undo last cut |

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | [React 19](https://react.dev/) + [TypeScript 5.9](https://www.typescriptlang.org/) | UI components and type safety |
| **Build** | [Vite 7](https://vite.dev/) | Fast dev server and production bundler |
| **3D Rendering** | [Three.js](https://threejs.org/) via [@react-three/fiber](https://r3f.docs.pmnd.rs/) | WebGL scene graph with React reconciler |
| **3D Helpers** | [@react-three/drei](https://drei.docs.pmnd.rs/) | OrbitControls, ContactShadows, Environment map |
| **State** | [Zustand](https://zustand.docs.pmnd.rs/) | Lightweight store for profile, tools, materials, lathe state |
| **Shaders** | Custom GLSL (inline) | Procedural wood grain with 3D simplex noise, growth rings, figuring patterns |
| **Styling** | CSS custom properties + Google Fonts | Workshop-themed design system |

## Project Structure

```
src/
├── components/
│   ├── LatheScene.tsx         # R3F Canvas, lighting, environment, camera
│   ├── PenBlank.tsx           # LatheGeometry from profile + material switching
│   ├── LatheModel.tsx         # Visual lathe (headstock, tailstock, tool rest, bed)
│   ├── CuttingInteraction.tsx # Raycast-based cutting with tool cursor
│   ├── Header.tsx             # App title
│   ├── ToolPanel.tsx          # Tool selection panel (left)
│   ├── MaterialPanel.tsx      # Wood/resin material picker (right)
│   └── ControlBar.tsx         # Lathe controls (bottom)
├── shaders/
│   ├── WoodMaterial.tsx       # Procedural wood grain GLSL shader
│   └── ResinMaterial.tsx      # Translucent resin physical material
├── store/
│   └── useStore.ts            # Zustand store with profile, tools, 10 wood presets
├── types/
│   └── index.ts               # Shared TypeScript types
├── main.tsx                   # App entry point
├── App.tsx                    # Layout, keyboard shortcuts, lazy loading
└── index.css                  # Global styles, workshop theme, glass-morphism panels
```

## How It Works

The pen blank is represented as a **surface of revolution** — an array of 101 radius values along the blank's length. Three.js `LatheGeometry` revolves this profile curve around an axis to create the 3D mesh.

When you drag a tool along the blank:
1. A raycast determines where the mouse intersects the blank's center plane
2. The tool's cut profile (width, depth, shape) is applied to nearby radius values
3. A new `LatheGeometry` is built from the updated profile
4. The old geometry is disposed to prevent GPU memory leaks

Wood grain is generated entirely in the **fragment shader** using 3D simplex noise. The shader simulates a virtual log — the blank's surface coordinates are mapped into "log space" where concentric growth rings, longitudinal grain streaks, and figuring patterns (curly, birdseye, quilted, burl) are computed procedurally. Each wood species has unique colour, density, curvature, and roughness parameters.

## Disclaimer

This project was created as a learning exercise to explore **Claude Code Agent Teams** — Anthropic's multi-agent orchestration feature where specialised AI agents collaborate in parallel on different parts of a codebase.

The entire application was built by a team of three agents coordinated by a lead agent:

| Agent | Role | What It Built |
|-------|------|---------------|
| **engine-dev** | 3D Engine Developer | `LatheScene`, `PenBlank`, `LatheModel`, `CuttingInteraction` — the entire Three.js scene, camera setup, lathe geometry, spinning animation, and interactive cutting mechanics |
| **shader-dev** | Shader Artist | `WoodMaterial`, `ResinMaterial` — procedural GLSL wood grain shaders with 3D simplex noise, growth rings, 5 figuring patterns, and translucent resin material |
| **ui-dev** | UI/UX Developer | `App`, `Header`, `ToolPanel`, `MaterialPanel`, `ControlBar`, `index.css` — the complete workshop-themed interface with floating panels, SVG tool icons, colour swatches, and keyboard shortcuts |

The **team lead** (the main Claude Code agent) handled:
- Project scaffolding (Vite + React + TypeScript + dependencies)
- Shared architecture (Zustand store, TypeScript types)
- Task breakdown and parallel agent coordination
- Integration of all components
- Bug fixing (WebGL context loss, rotation axis, GPU memory leaks, OrbitControls conflict)

All three agents worked **simultaneously** on their respective tasks, then the lead integrated their output and resolved cross-cutting issues. The project demonstrates how agent teams can parallelise frontend development across 3D rendering, shader programming, and UI design.

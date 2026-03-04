import { create } from 'zustand';
import type { AppState, PenBlank, ProfilePoint, ToolConfig, WoodConfig, WoodSpecies } from '../types';

const PROFILE_RESOLUTION = 100;
const DEFAULT_RADIUS = 0.375; // 3/4 inch diameter blank = 0.375 radius
const BLANK_LENGTH = 5.0; // 5 inches

function createInitialProfile(): ProfilePoint[] {
  const points: ProfilePoint[] = [];
  for (let i = 0; i <= PROFILE_RESOLUTION; i++) {
    points.push({
      t: i / PROFILE_RESOLUTION,
      radius: DEFAULT_RADIUS,
    });
  }
  return points;
}

const WOOD_PRESETS: Record<WoodSpecies, WoodConfig> = {
  oak: {
    species: 'oak',
    displayName: 'White Oak',
    baseColor: [0.76, 0.60, 0.42],
    grainColor: [0.55, 0.40, 0.25],
    grainDensity: 8.0,
    grainCurvature: 0.3,
    roughness: 0.45,
    figuring: 'none',
  },
  walnut: {
    species: 'walnut',
    displayName: 'Black Walnut',
    baseColor: [0.35, 0.22, 0.14],
    grainColor: [0.20, 0.12, 0.07],
    grainDensity: 6.0,
    grainCurvature: 0.2,
    roughness: 0.35,
    figuring: 'none',
  },
  maple: {
    species: 'maple',
    displayName: 'Hard Maple',
    baseColor: [0.88, 0.78, 0.65],
    grainColor: [0.75, 0.65, 0.52],
    grainDensity: 4.0,
    grainCurvature: 0.15,
    roughness: 0.25,
    figuring: 'curly',
  },
  cherry: {
    species: 'cherry',
    displayName: 'American Cherry',
    baseColor: [0.72, 0.45, 0.30],
    grainColor: [0.55, 0.30, 0.18],
    grainDensity: 5.0,
    grainCurvature: 0.25,
    roughness: 0.30,
    figuring: 'none',
  },
  ebony: {
    species: 'ebony',
    displayName: 'African Ebony',
    baseColor: [0.08, 0.06, 0.05],
    grainColor: [0.04, 0.03, 0.02],
    grainDensity: 12.0,
    grainCurvature: 0.1,
    roughness: 0.15,
    figuring: 'none',
  },
  padauk: {
    species: 'padauk',
    displayName: 'African Padauk',
    baseColor: [0.75, 0.20, 0.08],
    grainColor: [0.55, 0.12, 0.05],
    grainDensity: 7.0,
    grainCurvature: 0.35,
    roughness: 0.30,
    figuring: 'none',
  },
  purpleheart: {
    species: 'purpleheart',
    displayName: 'Purpleheart',
    baseColor: [0.45, 0.15, 0.40],
    grainColor: [0.30, 0.08, 0.28],
    grainDensity: 6.0,
    grainCurvature: 0.2,
    roughness: 0.28,
    figuring: 'none',
  },
  cocobolo: {
    species: 'cocobolo',
    displayName: 'Cocobolo',
    baseColor: [0.65, 0.30, 0.12],
    grainColor: [0.40, 0.15, 0.05],
    grainDensity: 10.0,
    grainCurvature: 0.5,
    roughness: 0.20,
    figuring: 'none',
  },
  olivewood: {
    species: 'olivewood',
    displayName: 'Olive Wood',
    baseColor: [0.72, 0.62, 0.42],
    grainColor: [0.40, 0.30, 0.15],
    grainDensity: 9.0,
    grainCurvature: 0.6,
    roughness: 0.30,
    figuring: 'none',
  },
  bocote: {
    species: 'bocote',
    displayName: 'Bocote',
    baseColor: [0.65, 0.50, 0.25],
    grainColor: [0.20, 0.12, 0.05],
    grainDensity: 14.0,
    grainCurvature: 0.7,
    roughness: 0.25,
    figuring: 'none',
  },
};

const TOOL_CONFIGS: ToolConfig[] = [
  {
    type: 'roughing-gouge',
    displayName: 'Roughing Gouge',
    cutWidth: 0.15,
    cutDepth: 0.04,
    profileShape: 'round',
    description: 'Wide, aggressive cuts for rounding the blank',
  },
  {
    type: 'spindle-gouge',
    displayName: 'Spindle Gouge',
    cutWidth: 0.06,
    cutDepth: 0.025,
    profileShape: 'round',
    description: 'Precise shaping cuts for curves and details',
  },
  {
    type: 'skew-chisel',
    displayName: 'Skew Chisel',
    cutWidth: 0.08,
    cutDepth: 0.015,
    profileShape: 'flat',
    description: 'Smooth finishing cuts and beads',
  },
  {
    type: 'parting-tool',
    displayName: 'Parting Tool',
    cutWidth: 0.02,
    cutDepth: 0.05,
    profileShape: 'flat',
    description: 'Narrow, deep cuts for grooves and sizing',
  },
  {
    type: 'scraper',
    displayName: 'Round Scraper',
    cutWidth: 0.10,
    cutDepth: 0.01,
    profileShape: 'round',
    description: 'Light finishing cuts for smoothing',
  },
];

function createInitialBlank(): PenBlank {
  return {
    length: BLANK_LENGTH,
    initialRadius: DEFAULT_RADIUS,
    profile: createInitialProfile(),
    material: 'wood',
    woodConfig: { ...WOOD_PRESETS.walnut },
  };
}

export const useStore = create<AppState>((set, get) => {
  let profileHistory: ProfilePoint[][] = [];

  return {
    blank: createInitialBlank(),
    activeTool: 'roughing-gouge',
    lathe: { spinning: true, speed: 2000 },
    tools: TOOL_CONFIGS,
    woodPresets: WOOD_PRESETS,

    setActiveTool: (tool) => set({ activeTool: tool }),

    setWoodSpecies: (species) =>
      set((state) => ({
        blank: {
          ...state.blank,
          material: 'wood',
          woodConfig: { ...WOOD_PRESETS[species] },
        },
      })),

    setMaterial: (material) =>
      set((state) => ({
        blank: {
          ...state.blank,
          material,
          woodConfig: material === 'wood' ? state.blank.woodConfig ?? { ...WOOD_PRESETS.walnut } : undefined,
          resinConfig: material === 'resin' ? { color: [0.1, 0.4, 0.7], opacity: 0.85, shimmer: false, shimmerColor: [1, 1, 1] } : undefined,
        },
      })),

    setResinColor: (color) =>
      set((state) => ({
        blank: {
          ...state.blank,
          resinConfig: state.blank.resinConfig
            ? { ...state.blank.resinConfig, color }
            : { color, opacity: 0.85, shimmer: false, shimmerColor: [1, 1, 1] },
        },
      })),

    toggleLathe: () =>
      set((state) => ({
        lathe: { ...state.lathe, spinning: !state.lathe.spinning },
      })),

    setLatheSpeed: (speed) =>
      set((state) => ({
        lathe: { ...state.lathe, speed },
      })),

    cutProfile: (position, depth) => {
      const state = get();
      const tool = state.tools.find((t) => t.type === state.activeTool);
      if (!tool) return;

      // Save current profile for undo
      profileHistory.push(state.blank.profile.map((p) => ({ ...p })));
      if (profileHistory.length > 50) profileHistory.shift();

      const halfWidth = tool.cutWidth / 2;
      const cutAmount = Math.min(depth, tool.cutDepth);
      const normalizedPos = position;

      const newProfile = state.blank.profile.map((point) => {
        const dist = Math.abs(point.t - normalizedPos);
        if (dist > halfWidth) return point;

        let factor: number;
        if (tool.profileShape === 'round') {
          factor = Math.cos((dist / halfWidth) * Math.PI * 0.5);
        } else if (tool.profileShape === 'v-shaped') {
          factor = 1 - dist / halfWidth;
        } else {
          factor = 1;
        }

        const newRadius = Math.max(0.02, point.radius - cutAmount * factor);
        return { ...point, radius: newRadius };
      });

      set({
        blank: { ...state.blank, profile: newProfile },
      });
    },

    resetBlank: () => {
      profileHistory = [];
      set({ blank: createInitialBlank() });
    },

    undo: () => {
      if (profileHistory.length === 0) return;
      const prev = profileHistory.pop()!;
      set((state) => ({
        blank: { ...state.blank, profile: prev },
      }));
    },
  };
});

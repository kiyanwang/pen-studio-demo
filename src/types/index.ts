// Pen Turning Simulator - Shared Types

export interface ProfilePoint {
  /** Position along the blank length (0-1) */
  t: number;
  /** Radius at this position */
  radius: number;
}

export type WoodSpecies =
  | 'oak'
  | 'walnut'
  | 'maple'
  | 'cherry'
  | 'ebony'
  | 'padauk'
  | 'purpleheart'
  | 'cocobolo'
  | 'olivewood'
  | 'bocote';

export type BlankMaterial = 'wood' | 'resin' | 'hybrid';

export interface WoodConfig {
  species: WoodSpecies;
  displayName: string;
  baseColor: [number, number, number];
  grainColor: [number, number, number];
  grainDensity: number;
  grainCurvature: number;
  roughness: number;
  figuring: 'none' | 'curly' | 'birdseye' | 'quilted' | 'burl';
}

export interface ResinConfig {
  color: [number, number, number];
  opacity: number;
  shimmer: boolean;
  shimmerColor: [number, number, number];
}

export type ToolType = 'roughing-gouge' | 'spindle-gouge' | 'skew-chisel' | 'parting-tool' | 'scraper';

export interface ToolConfig {
  type: ToolType;
  displayName: string;
  cutWidth: number;
  cutDepth: number;
  profileShape: 'round' | 'flat' | 'v-shaped';
  description: string;
}

export interface LatheState {
  spinning: boolean;
  speed: number; // RPM
}

export interface PenBlank {
  length: number;
  initialRadius: number;
  profile: ProfilePoint[];
  material: BlankMaterial;
  woodConfig?: WoodConfig;
  resinConfig?: ResinConfig;
}

export interface AppState {
  blank: PenBlank;
  activeTool: ToolType;
  lathe: LatheState;
  tools: ToolConfig[];
  woodPresets: Record<WoodSpecies, WoodConfig>;
  // Actions
  setActiveTool: (tool: ToolType) => void;
  setWoodSpecies: (species: WoodSpecies) => void;
  setMaterial: (material: BlankMaterial) => void;
  setResinColor: (color: [number, number, number]) => void;
  toggleLathe: () => void;
  setLatheSpeed: (speed: number) => void;
  cutProfile: (position: number, depth: number) => void;
  resetBlank: () => void;
  undo: () => void;
}

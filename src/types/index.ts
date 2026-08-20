export interface CubeCoordinates {
  q: number; // Column axis
  r: number; // Row axis
  s: number; // Diagonal axis (Invariant: q + r + s === 0)
}

export type CellId = string;

export type ChamberType =
  | 'verse_1'
  | 'pre_chorus'
  | 'chorus'
  | 'verse_2'
  | 'bridge'
  | 'outro'
  | 'pool'
  | 'discard';

export type Granularity = 'clause' | 'word-pair' | 'word';

export interface LyricCell {
  id: CellId;
  text: string;
  sourceTextId?: string;
  granularity: Granularity;
  coord: CubeCoordinates;
  pixelPosition: { x: number; y: number };
  rotationDeg: number; // subtle visual jitter (-2 to +2 deg)
  zIndex: number;
  isSelected?: boolean;
  isDragging?: boolean;

  // 6 edge connections: [0: N, 1: NE, 2: SE, 3: S, 4: SW, 5: NW]
  connectedEdges: (CellId | null)[];

  // Future heuristic metadata (unpopulated in PR 1)
  metadata?: {
    syllableCount?: number;
    meterPattern?: string;
    rhymeGroup?: string;
  };
}

export interface Chamber {
  id: string;
  type: ChamberType;
  title: string;
  cellIds: CellId[];
}

export interface LyricHiveState {
  cells: Record<CellId, LyricCell>;
  chambers: Record<string, Chamber>;
  activeSelection: CellId[];
  pan: { x: number; y: number };
  zoom: number;
}

// Swarm chunker engine types
export type SwarmStrategy =
  | 'clauses'
  | 'word-pairs'
  | 'isolated-words'
  | 'hybrid-cutup';

export interface SwarmOptions {
  strategy: SwarmStrategy;
  preservePunctuation?: boolean;
  minWordLength?: number;
  seed?: number; // deterministic pseudo-random scatter
  scatterRadius?: number; // distance from canvas center in grid units
}

// Forward-compatible extension interfaces (stubs only)
export interface ILyricAnalyzer {
  countSyllables(text: string): number;
  analyzeStress(text: string): string;
}

export interface IBYOKProvider {
  generateThematicBridge(phrases: string[], prompt: string): Promise<string[]>;
}

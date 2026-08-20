import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { LyricCell, Chamber, CellId, CubeCoordinates, SwarmStrategy, ChamberType } from '../types';
import { generateScatterCoordinates, chunkText } from '../core/swarm';
import { cubeToPixel, cubeDistance, getNeighbor, CUBE_DIRECTIONS, cubeEquals } from '../core/hex';

interface AppState {
  cells: Record<CellId, LyricCell>;
  chambers: Record<string, Chamber>;
  activeSelection: CellId[];
  pan: { x: number; y: number };
  zoom: number;

  // History for Undo/Redo
  past: { cells: Record<CellId, LyricCell>; chambers: Record<string, Chamber> }[];
  future: { cells: Record<CellId, LyricCell>; chambers: Record<string, Chamber> }[];

  // Actions
  _saveHistory: () => void;
  addCellsFromText: (text: string, strategy: SwarmStrategy) => void;
  moveCell: (id: CellId, targetCoord: CubeCoordinates) => void;
  moveCells: (ids: CellId[], deltaQ: number, deltaR: number, deltaS: number) => void;
  setSelection: (ids: CellId[]) => void;
  assignToChamber: (chamberId: string, cellIds: CellId[]) => void;
  removeFromChamber: (chamberId: string, cellIds: CellId[]) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;
  undo: () => void;
  redo: () => void;
  snapCell: (id: CellId) => void; // checks proximity to all other cells and binds edges
}

const HEX_RADIUS = 50;
const INITIAL_CHAMBERS: Record<string, Chamber> = {
  'verse_1': { id: 'verse_1', type: 'verse_1', title: 'Verse 1', cellIds: [] },
  'pre_chorus': { id: 'pre_chorus', type: 'pre_chorus', title: 'Pre-Chorus', cellIds: [] },
  'chorus': { id: 'chorus', type: 'chorus', title: 'Chorus', cellIds: [] },
  'verse_2': { id: 'verse_2', type: 'verse_2', title: 'Verse 2', cellIds: [] },
  'bridge': { id: 'bridge', type: 'bridge', title: 'Bridge', cellIds: [] },
  'outro': { id: 'outro', type: 'outro', title: 'Outro', cellIds: [] },
  'pool': { id: 'pool', type: 'pool', title: 'Pool', cellIds: [] },
  'discard': { id: 'discard', type: 'discard', title: 'Discard', cellIds: [] }
};

export const useStore = create<AppState>((set, get) => ({
  cells: {},
  chambers: INITIAL_CHAMBERS,
  activeSelection: [],
  pan: { x: 0, y: 0 },
  zoom: 1,

  past: [],
  future: [],

  _saveHistory: () => {
    set((state) => ({
      past: [...state.past, { cells: JSON.parse(JSON.stringify(state.cells)), chambers: JSON.parse(JSON.stringify(state.chambers)) }],
      future: [],
    }));
  },

  addCellsFromText: (text: string, strategy: SwarmStrategy) => {
    get()._saveHistory();

    const chunks = chunkText(text, strategy);
    const coords = generateScatterCoordinates(chunks.length, Math.random() * 1000);

    set((state) => {
      const newCells = { ...state.cells };
      chunks.forEach((chunk, i) => {
        const id = uuidv4();
        const coord = coords[i];
        newCells[id] = {
          id,
          text: chunk,
          granularity: strategy === 'clauses' ? 'clause' : strategy === 'word-pairs' ? 'word-pair' : 'word',
          coord,
          pixelPosition: cubeToPixel(coord, HEX_RADIUS),
          rotationDeg: (Math.random() - 0.5) * 4, // -2 to +2 jitter
          zIndex: Object.keys(newCells).length,
          connectedEdges: [null, null, null, null, null, null]
        };
      });
      return { cells: newCells };
    });
  },

  moveCell: (id: CellId, targetCoord: CubeCoordinates) => {
    set((state) => {
      const cell = state.cells[id];
      if (!cell) return state;

      const newCells = { ...state.cells };
      newCells[id] = {
        ...cell,
        coord: targetCoord,
        pixelPosition: cubeToPixel(targetCoord, HEX_RADIUS)
      };

      return { cells: newCells };
    });
  },

  moveCells: (ids: CellId[], deltaQ: number, deltaR: number, deltaS: number) => {
      get()._saveHistory();
      set((state) => {
          const newCells = { ...state.cells };
          ids.forEach(id => {
             const c = newCells[id];
             if (c) {
                 const newCoord = { q: c.coord.q + deltaQ, r: c.coord.r + deltaR, s: c.coord.s + deltaS };
                 newCells[id] = {
                     ...c,
                     coord: newCoord,
                     pixelPosition: cubeToPixel(newCoord, HEX_RADIUS)
                 };
             }
          });
          return { cells: newCells };
      });
  },

  setSelection: (ids: CellId[]) => set({ activeSelection: ids }),

  assignToChamber: (chamberId: string, cellIds: CellId[]) => {
    get()._saveHistory();
    set((state) => {
      const newChambers = { ...state.chambers };
      if (!newChambers[chamberId]) return state;

      // Remove from any existing chambers first
      Object.keys(newChambers).forEach(cId => {
        newChambers[cId] = {
          ...newChambers[cId],
          cellIds: newChambers[cId].cellIds.filter(id => !cellIds.includes(id))
        };
      });

      // Add to new chamber
      newChambers[chamberId] = {
        ...newChambers[chamberId],
        cellIds: [...newChambers[chamberId].cellIds, ...cellIds]
      };

      return { chambers: newChambers };
    });
  },

  removeFromChamber: (chamberId: string, cellIds: CellId[]) => {
    get()._saveHistory();
    set((state) => {
      const newChambers = { ...state.chambers };
      if (!newChambers[chamberId]) return state;

      newChambers[chamberId] = {
        ...newChambers[chamberId],
        cellIds: newChambers[chamberId].cellIds.filter(id => !cellIds.includes(id))
      };
      return { chambers: newChambers };
    });
  },

  setPan: (pan) => set({ pan }),
  setZoom: (zoom) => set({ zoom }),

  undo: () => set((state) => {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);

    return {
      cells: previous.cells,
      chambers: previous.chambers,
      past: newPast,
      future: [{ cells: state.cells, chambers: state.chambers }, ...state.future]
    };
  }),

  redo: () => set((state) => {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    const newFuture = state.future.slice(1);

    return {
      cells: next.cells,
      chambers: next.chambers,
      past: [...state.past, { cells: state.cells, chambers: state.chambers }],
      future: newFuture
    };
  }),

  snapCell: (id: CellId) => {
    get()._saveHistory();
    set((state) => {
      const cell = state.cells[id];
      if (!cell) return state;

      const newCells = JSON.parse(JSON.stringify(state.cells));

      // Clear existing bindings for this cell in other cells
      for (const edge of cell.connectedEdges) {
          if (edge) {
             const neighbor = newCells[edge];
             if (neighbor) {
                 const dirIdx = neighbor.connectedEdges.indexOf(id);
                 if (dirIdx !== -1) neighbor.connectedEdges[dirIdx] = null;
             }
          }
      }
      newCells[id].connectedEdges = [null, null, null, null, null, null];

      // Check all other cells for proximity
      Object.values(newCells).forEach((other: any) => {
        if (other.id === id) return;

        // Check if coords are neighbors
        const dist = cubeDistance(cell.coord, other.coord);
        if (dist === 1) {
           // Determine direction
           CUBE_DIRECTIONS.forEach((_, idx) => {
              const expectedNeighbor = getNeighbor(cell.coord, idx);
              if (cubeEquals(expectedNeighbor, other.coord)) {
                 newCells[id].connectedEdges[idx] = other.id;
                 newCells[other.id].connectedEdges[(idx + 3) % 6] = id;
              }
           });
        } else if (dist === 0) {
            // Collision resolution - bump it
            newCells[id].coord = getNeighbor(newCells[id].coord, 0); // bump North
            newCells[id].pixelPosition = cubeToPixel(newCells[id].coord, HEX_RADIUS);
            // Re-eval snapping might be needed, but simplistic for PR1
        }
      });

      return { cells: newCells };
    });
  }
}));

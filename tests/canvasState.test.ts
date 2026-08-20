import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../src/store';
import { CUBE_DIRECTIONS } from '../src/core/hex';

describe('Canvas State & Snapping', () => {
  beforeEach(() => {
    // Reset store
    useStore.setState({
      cells: {},
      chambers: {},
      past: [],
      future: [],
      activeSelection: [],
      pan: {x:0, y:0},
      zoom: 1
    });
  });

  it('binds correct edges when snapped adjacent', () => {
    useStore.getState().addCellsFromText('One Two', 'isolated-words');
    const state = useStore.getState();
    const cellIds = Object.keys(state.cells);
    const idA = cellIds[0];
    const idB = cellIds[1];

    // Move B exactly one hex north of A
    useStore.getState().moveCell(idA, { q: 0, r: 0, s: 0 });
    useStore.getState().moveCell(idB, { q: 0, r: -1, s: 1 }); // North is index 0
    useStore.getState().snapCell(idB);

    const updatedState = useStore.getState();
    const updatedA = updatedState.cells[idA];
    const updatedB = updatedState.cells[idB];

    expect(updatedA.connectedEdges[0]).toBe(idB); // A's North is B
    expect(updatedB.connectedEdges[3]).toBe(idA); // B's South is A
  });

  it('undo restores prior coordinates exactly', () => {
    useStore.getState().addCellsFromText('Test', 'isolated-words');
    const id = Object.keys(useStore.getState().cells)[0];

    const initialCoord = useStore.getState().cells[id].coord;

    // Simulate a move
    useStore.getState()._saveHistory(); // manually trigger since moveCell doesn't
    useStore.getState().moveCell(id, { q: 5, r: 5, s: -10 });

    expect(useStore.getState().cells[id].coord.q).toBe(5);

    useStore.getState().undo();

    expect(useStore.getState().cells[id].coord).toEqual(initialCoord);
  });
});

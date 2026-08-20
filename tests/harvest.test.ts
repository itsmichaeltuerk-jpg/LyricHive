import { describe, it, expect } from 'vitest';
import { harvestComb } from '../src/core/harvest';
import { LyricCell } from '../src/types';

describe('Harvest Engine', () => {
  it('traverses connected comb and outputs expected word sequence', () => {
    // Setup a mini mock state
    const cells: Record<string, LyricCell> = {
      'c1': { id: 'c1', text: 'This', connectedEdges: [null, null, 'c2', null, null, null], pixelPosition: {x: 0, y: 0} } as any,
      'c2': { id: 'c2', text: 'is', connectedEdges: [null, null, 'c3', null, null, 'c1'], pixelPosition: {x: 50, y: 0} } as any,
      'c3': { id: 'c3', text: 'a', connectedEdges: [null, null, 'c4', null, null, 'c2'], pixelPosition: {x: 100, y: 0} } as any,
      'c4': { id: 'c4', text: 'test', connectedEdges: [null, null, null, null, null, 'c3'], pixelPosition: {x: 150, y: 0} } as any,
    };

    const output = harvestComb('c2', cells); // Start in middle to test traversal sorting
    expect(output).toBe('This is a test');
  });
});

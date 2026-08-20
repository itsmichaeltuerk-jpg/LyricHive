import { describe, it, expect } from 'vitest';
import { chunkText, generateScatterCoordinates } from '../src/core/swarm';

describe('Swarm Engine', () => {
  it('splits clauses and respects punctuation', () => {
    const text = "Hello world, this is a test. We like coding but it is hard.";
    const chunks = chunkText(text, 'clauses', true);

    expect(chunks.length).toBeGreaterThan(0);
    // Should split on comma, period, and "but"
    expect(chunks.some(c => c.includes("Hello world,"))).toBe(true);
    expect(chunks.some(c => c.includes("this is a test."))).toBe(true);
    expect(chunks.some(c => c.includes("We like coding"))).toBe(true);
  });

  it('generates identical coordinates for same seed', () => {
    const coords1 = generateScatterCoordinates(10, 123);
    const coords2 = generateScatterCoordinates(10, 123);

    expect(coords1).toEqual(coords2);
  });

  it('prevents coordinate collisions', () => {
    const coords = generateScatterCoordinates(50, 42);
    const set = new Set(coords.map(c => `${c.q},${c.r},${c.s}`));
    expect(set.size).toBe(50); // all unique
  });
});

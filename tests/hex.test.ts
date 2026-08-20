import { describe, it, expect } from 'vitest';
import { cubeToPixel, pixelToCube, cubeDistance, cubeEquals, CUBE_DIRECTIONS } from '../src/core/hex';
import { CubeCoordinates } from '../src/types';

describe('Hex Math', () => {
  const hexRadius = 50;

  it('round-trips cubeToPixel and pixelToCube correctly', () => {
    const coords: CubeCoordinates[] = [
      { q: 0, r: 0, s: 0 },
      { q: 1, r: -1, s: 0 },
      { q: 2, r: -1, s: -1 },
      { q: -3, r: 5, s: -2 }
    ];

    for (const c of coords) {
      const p = cubeToPixel(c, hexRadius);
      const c2 = pixelToCube(p.x, p.y, hexRadius);
      expect(cubeEquals(c, c2)).toBe(true);
    }
  });

  it('calculates cubeDistance correctly', () => {
    const a = { q: 0, r: 0, s: 0 };
    const b = { q: 2, r: -1, s: -1 };
    expect(cubeDistance(a, b)).toBe(2);

    const c = { q: -3, r: 3, s: 0 };
    expect(cubeDistance(a, c)).toBe(3);
    expect(cubeDistance(b, c)).toBe(5);
  });
});

import { CubeCoordinates } from '../../types';

export const CUBE_DIRECTIONS: CubeCoordinates[] = [
  { q: 0, r: -1, s: 1 },  // N (0)
  { q: 1, r: -1, s: 0 },  // NE (1)
  { q: 1, r: 0, s: -1 },  // SE (2)
  { q: 0, r: 1, s: -1 },  // S (3)
  { q: -1, r: 1, s: 0 },  // SW (4)
  { q: -1, r: 0, s: 1 },  // NW (5)
];

export function cubeDistance(a: CubeCoordinates, b: CubeCoordinates): number {
  return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a.s - b.s));
}

export function cubeAdd(a: CubeCoordinates, b: CubeCoordinates): CubeCoordinates {
  return { q: a.q + b.q, r: a.r + b.r, s: a.s + b.s };
}

export function cubeSubtract(a: CubeCoordinates, b: CubeCoordinates): CubeCoordinates {
  return { q: a.q - b.q, r: a.r - b.r, s: a.s - b.s };
}

export function getNeighbor(coord: CubeCoordinates, direction: number): CubeCoordinates {
  return cubeAdd(coord, CUBE_DIRECTIONS[direction % 6]);
}

// Flat-topped hex orientation
export function cubeToPixel(coord: CubeCoordinates, hexRadius: number): { x: number, y: number } {
  const x = hexRadius * (3/2 * coord.q);
  const y = hexRadius * ((Math.sqrt(3)/2 * coord.q) + (Math.sqrt(3) * coord.r));
  return { x, y };
}

export function pixelToCube(x: number, y: number, hexRadius: number): CubeCoordinates {
  const q = (2/3 * x) / hexRadius;
  const r = ((-1/3 * x) + (Math.sqrt(3)/3 * y)) / hexRadius;
  return cubeRound(q, r, -q - r);
}

export function cubeRound(q: number, r: number, s: number): CubeCoordinates {
  let rq = Math.round(q);
  let rr = Math.round(r);
  let rs = Math.round(s);

  const qDiff = Math.abs(rq - q);
  const rDiff = Math.abs(rr - r);
  const sDiff = Math.abs(rs - s);

  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  } else {
    rs = -rq - rr;
  }

  return { q: rq, r: rr, s: rs };
}

export function cubeEquals(a: CubeCoordinates, b: CubeCoordinates): boolean {
  return a.q === b.q && a.r === b.r && a.s === b.s;
}

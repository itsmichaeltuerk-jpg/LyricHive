import { SwarmOptions, SwarmStrategy, CubeCoordinates } from '../../types';
import { getNeighbor, cubeDistance } from '../hex';

// Pseudo-random number generator for deterministic scatter
export class PRNG {
  private state: number;
  constructor(seed: number) {
    this.state = seed ? seed : 1;
  }
  next(): number {
    this.state = (this.state * 16807) % 2147483647;
    return (this.state - 1) / 2147483646;
  }
}

export function chunkText(text: string, strategy: SwarmStrategy, preservePunctuation = true): string[] {
  let chunks: string[] = [];

  switch (strategy) {
    case 'clauses': {
      // Split on punctuation and coordinating conjunctions
      const regex = preservePunctuation
        ? /([.,;\-]|[\n\r]+|\b(?:and|but|or|yet|because|although)\b)/gi
        : /[.,;\-]|[\n\r]+|\b(?:and|but|or|yet|because|although)\b/gi;

      const rawChunks = text.split(regex);

      let currentChunk = '';
      for (const token of rawChunks) {
        if (!token) continue;

        const isSeparator = token.match(/^[.,;\-]|[\n\r]+|\b(?:and|but|or|yet|because|although)\b$/i);

        if (isSeparator) {
          if (preservePunctuation) {
            currentChunk += token;
          }
          if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
          }
          currentChunk = preservePunctuation ? token : '';
        } else {
          currentChunk += token;
        }
      }
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }

      // Clean up chunks if preservePunctuation is true (the separator might be pushed alone)
      if (preservePunctuation) {
        const cleaned: string[] = [];
        let temp = '';
        for (const c of chunks) {
            if (c.match(/^[.,;\-]$/)) {
                if (cleaned.length > 0) {
                   cleaned[cleaned.length - 1] += c;
                } else {
                   temp += c;
                }
            } else {
                cleaned.push(temp + c);
                temp = '';
            }
        }
        chunks = cleaned;
      }
      break;
    }

    case 'word-pairs': {
      const words = text.match(/\b\w+\b/g) || [];
      for (let i = 0; i < words.length; i += 2) {
        if (i + 1 < words.length) {
          chunks.push(`${words[i]} ${words[i+1]}`);
        } else {
          chunks.push(words[i]);
        }
      }
      break;
    }

    case 'isolated-words': {
      chunks = text.match(/\b\w+\b/g) || [];
      break;
    }

    case 'hybrid-cutup': {
      // Simplistic hybrid: randomly mix clauses and words
      const words = text.match(/\b\w+\b/g) || [];
      chunks = words; // For PR1, fallback to words, or implement simple logic
      break;
    }
  }

  return chunks.filter(c => c.trim().length > 0);
}

export function generateScatterCoordinates(count: number, seed: number = 12345): CubeCoordinates[] {
  const prng = new PRNG(seed);
  const coords: CubeCoordinates[] = [];
  const occupied = new Set<string>();

  // Start with origin
  let current: CubeCoordinates = { q: 0, r: 0, s: 0 };
  let radius = 1;
  let direction = 0;

  // To avoid clump at origin, generate a spiral/random ring
  for (let i = 0; i < count; i++) {
     let candidate = { ...current };

     // Random walk to find an empty spot near current
     let attempts = 0;
     while (occupied.has(`${candidate.q},${candidate.r},${candidate.s}`) && attempts < 100) {
        const dir = Math.floor(prng.next() * 6);
        candidate = getNeighbor(candidate, dir);
        attempts++;
     }

     // If still occupied (very unlikely but possible), expand ring deterministically
     if (occupied.has(`${candidate.q},${candidate.r},${candidate.s}`)) {
        // Find first unoccupied in spiral
        let spiraling = true;
        let r = 1;
        while(spiraling) {
            let cx = r;
            let cy = -r;
            let cz = 0;
            const spiralDirs = [
               {q: -1, r: 1, s: 0}, {q: -1, r: 0, s: 1}, {q: 0, r: -1, s: 1},
               {q: 1, r: -1, s: 0}, {q: 1, r: 0, s: -1}, {q: 0, r: 1, s: -1}
            ];
            for (let j = 0; j < 6; j++) {
                for (let k = 0; k < r; k++) {
                    const hash = `${cx},${cy},${cz}`;
                    if (!occupied.has(hash)) {
                        candidate = {q: cx, r: cy, s: cz};
                        spiraling = false;
                        break;
                    }
                    cx += spiralDirs[j].q;
                    cy += spiralDirs[j].r;
                    cz += spiralDirs[j].s;
                }
                if (!spiraling) break;
            }
            r++;
        }
     }

     coords.push(candidate);
     occupied.add(`${candidate.q},${candidate.r},${candidate.s}`);

     // Move current roughly outwards for next item
     if (i > 0 && i % (radius * 6) === 0) {
         radius++;
     }
  }

  return coords;
}

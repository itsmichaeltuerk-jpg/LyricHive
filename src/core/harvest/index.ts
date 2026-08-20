import { CellId, LyricCell } from '../../types';

export function harvestComb(
  startCellId: CellId,
  cells: Record<CellId, LyricCell>
): string {
  const visited = new Set<CellId>();
  const order: LyricCell[] = [];

  // Simple DFS or BFS to harvest words. Left-to-right heuristic based on pixel x.
  // For PR1: Traverse connected components and sort them visually left-to-right, top-to-bottom

  const queue: CellId[] = [startCellId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;

    visited.add(currentId);
    order.push(cells[currentId]);

    for (const neighborId of cells[currentId].connectedEdges) {
      if (neighborId && !visited.has(neighborId)) {
        queue.push(neighborId);
      }
    }
  }

  // Sort logically: primarily by r (row equivalent), then q (col equivalent)
  // Or pixel position Y then X for visual reading order
  order.sort((a, b) => {
    // Threshold for same line
    if (Math.abs(a.pixelPosition.y - b.pixelPosition.y) > 20) {
       return a.pixelPosition.y - b.pixelPosition.y;
    }
    return a.pixelPosition.x - b.pixelPosition.x;
  });

  return order.map(c => c.text).join(' ');
}

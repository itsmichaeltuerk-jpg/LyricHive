import React, { useState, useEffect } from 'react';
import { LyricCell } from '../../types';
import { useStore } from '../../store';
import { pixelToCube, cubeRound } from '../../core/hex';

interface CellProps {
  cell: LyricCell;
}

export const Cell: React.FC<CellProps> = ({ cell }) => {
  const moveCell = useStore((state) => state.moveCell);
  const setSelection = useStore((state) => state.setSelection);
  const snapCell = useStore((state) => state.snapCell);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState(cell.pixelPosition);

  // Sync with store when not dragging
  useEffect(() => {
    if (!isDragging) {
      setPosition(cell.pixelPosition);
    }
  }, [cell.pixelPosition, isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setSelection([cell.id]);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    // Snap to grid
    const targetCube = pixelToCube(position.x, position.y, 50);
    moveCell(cell.id, targetCube);

    // Re-evaluate snapping with neighbors
    // Adding a slight delay allows the store to update coord first
    setTimeout(() => {
        snapCell(cell.id);
    }, 10);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'absolute',
        width: '86px', // Roughly width of a radius 50 hex
        height: '100px', // Roughly height
        left: position.x - 43, // center offset
        top: position.y - 50,
        transform: `rotate(${cell.rotationDeg}deg)`,
        zIndex: isDragging ? 1000 : cell.zIndex,
        cursor: isDragging ? 'grabbing' : 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        willChange: 'transform, left, top',
        filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
      }}
    >
      <svg width="86" height="100" viewBox="0 0 86 100" style={{ position: 'absolute' }}>
        <polygon
          points="43,0 86,25 86,75 43,100 0,75 0,25"
          fill="#fdfbf7"
          stroke={isDragging ? "#3b82f6" : "#cbd5e1"}
          strokeWidth="2"
        />
      </svg>
      <span style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 500,
          userSelect: 'none',
          padding: '0 10px'
      }}>
        {cell.text}
      </span>
    </div>
  );
};

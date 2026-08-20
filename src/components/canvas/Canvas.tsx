import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Cell } from './Cell';

export const Canvas: React.FC = () => {
  const { cells, pan, setPan, zoom, setZoom } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.target === containerRef.current) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(Math.max(0.1, Math.min(zoom * delta, 3)));
    } else {
        setPan({ x: pan.x - e.deltaX, y: pan.y - e.deltaY });
    }
  };

  // Add passive false to wheel event to allow preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const wheelHandler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(Math.max(0.1, Math.min(zoom * delta, 3)));
      }
    };

    el.addEventListener('wheel', wheelHandler, { passive: false });
    return () => el.removeEventListener('wheel', wheelHandler);
  }, [zoom, setZoom]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f1f5f9',
        cursor: isPanning ? 'grabbing' : 'grab',
        touchAction: 'none'
      }}
    >
      <div
        style={{
          position: 'absolute',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          willChange: 'transform',
          width: 0,
          height: 0
        }}
      >
        {Object.values(cells).map(cell => (
          <Cell key={cell.id} cell={cell} />
        ))}
      </div>
    </div>
  );
};

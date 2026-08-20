import React, { useState } from 'react';
import { useStore } from '../../store';
import { SwarmStrategy } from '../../types';
import { harvestComb } from '../../core/harvest';

export const Toolbar: React.FC = () => {
  const { addCellsFromText, undo, redo, past, future, cells, activeSelection } = useStore();
  const [text, setText] = useState('');
  const [strategy, setStrategy] = useState<SwarmStrategy>('clauses');

  const handleSwarm = () => {
    if (!text.trim()) return;
    addCellsFromText(text, strategy);
    setText('');
  };

  const handleHarvest = () => {
     if (activeSelection.length === 0) {
         alert("Select a cell to harvest its comb.");
         return;
     }
     const result = harvestComb(activeSelection[0], cells);
     alert("Harvest Result:\n" + result);
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      display: 'flex',
      gap: '12px',
      zIndex: 1000,
      alignItems: 'center'
    }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste lyrics/text here..."
        style={{ width: '250px', height: '40px', resize: 'none', padding: '4px' }}
      />

      <select
        value={strategy}
        onChange={(e) => setStrategy(e.target.value as SwarmStrategy)}
        style={{ padding: '8px' }}
      >
        <option value="clauses">Clauses</option>
        <option value="word-pairs">Word Pairs</option>
        <option value="isolated-words">Isolated Words</option>
      </select>

      <button
        onClick={handleSwarm}
        style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Swarm
      </button>

      <div style={{ width: '1px', height: '30px', backgroundColor: '#e2e8f0', margin: '0 8px' }} />

      <button onClick={undo} disabled={past.length === 0} style={{ padding: '8px', cursor: past.length ? 'pointer' : 'not-allowed' }}>Undo</button>
      <button onClick={redo} disabled={future.length === 0} style={{ padding: '8px', cursor: future.length ? 'pointer' : 'not-allowed' }}>Redo</button>

      <div style={{ width: '1px', height: '30px', backgroundColor: '#e2e8f0', margin: '0 8px' }} />

      <button
        onClick={handleHarvest}
        style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Harvest
      </button>
    </div>
  );
};

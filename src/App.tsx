import React from 'react';
import { Canvas } from './components/canvas/Canvas';
import { Toolbar } from './components/controls/Toolbar';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Canvas />
      <Toolbar />
    </div>
  );
}

export default App;

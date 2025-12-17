import React from 'react';
import './App.css';
import './styles/theme.css';
import PlottingPage from './pages/PlottingPage';

/**
 * PUBLIC_INTERFACE
 * App is the entrypoint rendering the PlottingPage per design.
 */
function App() {
  return (
    <div className="App" style={{ minHeight: '100vh', background: 'var(--bg-canvas)', padding: 16 }}>
      <PlottingPage />
    </div>
  );
}

export default App;

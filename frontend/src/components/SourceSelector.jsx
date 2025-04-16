import React from 'react';

function SourceSelector({ setSource }) {
  return (
    <div className="section">
      <h2>Select Data Source</h2>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={() => setSource('ClickHouse')}>ClickHouse</button>
        <button onClick={() => setSource('FlatFile')}>Flat File</button>
      </div>
    </div>
  );
}

export default SourceSelector;


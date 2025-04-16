import React from 'react';

function StatusDisplay({ status }) {
  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Status</h3>
      <p>{status || 'Idle'}</p>
    </div>
  );
}

export default StatusDisplay;

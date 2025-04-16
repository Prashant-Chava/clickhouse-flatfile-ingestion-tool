import React, { useState } from 'react';
import axios from 'axios';

function ConfigForm({ setColumns, setStatus }) {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [jwtToken, setJwtToken] = useState('');

  const handleConnect = async () => {
    setStatus('🔌 Connecting to ClickHouse...');
    try {
      const response = await axios.post('http://127.0.0.1:8000/connect/clickhouse', {
        host,
        port,
        username,
        jwt_token: jwtToken,
        secure: false,
      });

      if (response.data.tables) {
        setStatus(` Connected! Tables: ${response.data.tables.join(', ')}`);
        // If needed, setColumns based on table
      } else {
        setStatus(' Connected but no tables found.');
      }
    } catch (error) {
      console.error(error);
      setStatus(' Connection failed. Please check your parameters.');
    }
  };

  return (
    <div className="section">
      <h2>Connect to ClickHouse</h2>

      <input
        type="text"
        placeholder="Host (e.g., localhost)"
        value={host}
        onChange={(e) => setHost(e.target.value)}
      />
      <input
        type="text"
        placeholder="Port (e.g., 8123)"
        value={port}
        onChange={(e) => setPort(e.target.value)}
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="JWT Token (Password)"
        value={jwtToken}
        onChange={(e) => setJwtToken(e.target.value)}
      />

      <button onClick={handleConnect}>🔌 Connect</button>
    </div>
  );
}

export default ConfigForm;

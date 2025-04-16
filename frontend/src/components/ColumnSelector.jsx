import React, { useState } from 'react';

function ColumnSelector({ columns, setSelectedColumns, setStatus, setColumns }) {
  const [file, setFile] = useState(null);
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [jwtToken, setJwtToken] = useState('');
  const [table, setTable] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleColumnSelection = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedColumns(selected);
  };

  const handleUpload = async () => {
    setStatus('Uploading file and reading columns...');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/connect/flatfile', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.columns) {
        setStatus('File uploaded! Columns loaded.');
        setColumns(data.columns);
      } else {
        setStatus('Unexpected response from server.');
      }
    } catch (error) {
      console.error(error);
      setStatus('File upload failed.');
    }
  };

  const handleIngest = async () => {
    if (!file || !table || !host || !port || !username || !jwtToken) {
      setStatus('Please fill all fields and upload a file first.');
      return;
    }

    setStatus('Ingesting file to ClickHouse...');
    const formData = new FormData();
    formData.append('file', file);

    const queryParams = new URLSearchParams({
      host,
      port,
      username,
      jwt_token: jwtToken,
      table,
      secure: false,
    });

    try {
      const response = await fetch(`http://127.0.0.1:8000/ingest/file-to-clickhouse?${queryParams.toString()}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setStatus(`Ingestion complete! ${result.row_count} rows inserted.`);
      } else {
        setStatus(`Error: ${result.detail}`);
      }
    } catch (error) {
      console.error(error);
      setStatus('Ingestion failed. Check console for details.');
    }
  };

  return (
    <div>
      <h2>Upload CSV File</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload and Preview</button>

      {columns.length > 0 && (
        <>
          <h3>Select Columns</h3>
          <select multiple onChange={handleColumnSelection}>
            {columns.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </>
      )}

      <h3>ClickHouse Target Details</h3>
      <input type="text" placeholder="Host" value={host} onChange={(e) => setHost(e.target.value)} />
      <input type="text" placeholder="Port" value={port} onChange={(e) => setPort(e.target.value)} />
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="text" placeholder="JWT Token" value={jwtToken} onChange={(e) => setJwtToken(e.target.value)} />
      <input type="text" placeholder="Target Table Name" value={table} onChange={(e) => setTable(e.target.value)} />

      <button onClick={handleIngest} style={{ marginTop: '10px' }}>
         Ingest to ClickHouse
      </button>
    </div>
  );
}

export default ColumnSelector;

import React, { useState } from 'react';
import axios from 'axios';

function ExportForm({ setStatus }) {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [jwtToken, setJwtToken] = useState('');
  const [table, setTable] = useState('');
  const [columns, setColumns] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handleExport = async () => {
    if (!host || !port || !username || !jwtToken || !table || !columns) {
      setStatus(' Please fill in all fields.');
      return;
    }

    setStatus(' Exporting data...');
    setIsExporting(true);

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/ingest/clickhouse-to-file',
        {
          host,
          port,
          username,
          jwt_token: jwtToken,
          table,
          columns: columns.split(',').map((c) => c.trim()),
          secure: false,
        },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${table}_export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setStatus('CSV download started!');
    } catch (error) {
      console.error(error);
      setStatus(' Export failed. See console for details.');
    }

    setIsExporting(false);
  };

  const handlePreview = async () => {
    setStatus(' Fetching preview...');
    setPreviewData(null);

    try {
      const response = await axios.post('http://127.0.0.1:8000/preview/clickhouse', {
        host,
        port,
        username,
        jwt_token: jwtToken,
        table,
        columns: columns.split(',').map(c => c.trim()),
        secure: false,
      });

      setPreviewData(response.data);
      setStatus('Preview loaded!');
    } catch (error) {
      console.error(error);
      setStatus(' Failed to load preview.');
    }
  };

  return (
    <div className="section">
      <h2>Export ClickHouse Table to CSV</h2>

      <input type="text" placeholder="Host" value={host} onChange={(e) => setHost(e.target.value)} />
      <input type="text" placeholder="Port" value={port} onChange={(e) => setPort(e.target.value)} />
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="text" placeholder="JWT Token" value={jwtToken} onChange={(e) => setJwtToken(e.target.value)} />
      <input type="text" placeholder="Table Name" value={table} onChange={(e) => setTable(e.target.value)} />
      <input
        type="text"
        placeholder="Columns (comma separated)"
        value={columns}
        onChange={(e) => setColumns(e.target.value)}
      />

      <button onClick={handleExport} disabled={isExporting}>
        {isExporting ? 'Exporting...' : '⬇️ Export to CSV'}
      </button>

      <button onClick={handlePreview} style={{ marginLeft: '10px' }}>
        👁️ Preview Data
      </button>

      {isExporting && (
        <div className="progress-bar">
          <div className="progress" />
        </div>
      )}

      {previewData && (
        <div className="preview-table">
          <h3>Data Preview</h3>
          <table>
            <thead>
              <tr>
                {previewData.columns.map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.rows.map((row, idx) => (
                <tr key={idx}>
                  {row.map((cell, i) => (
                    <td key={i}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ExportForm;

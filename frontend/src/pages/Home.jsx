import React, { useState } from 'react';
import SourceSelector from '../components/SourceSelector';
import ConfigForm from '../components/ConfigForm';
import ColumnSelector from '../components/ColumnSelector';
import StatusDisplay from '../components/StatusDisplay';
import ExportForm from '../components/ExportForm';

function Home() {
  const [source, setSource] = useState('');
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [status, setStatus] = useState('');

  return (
    <div className="container">
      <h1>ClickHouse & Flat File Data Ingestion</h1>

      <SourceSelector setSource={setSource} />

      {source === 'ClickHouse' && (
        <>
          <ConfigForm setColumns={setColumns} setStatus={setStatus} />
          <ExportForm setStatus={setStatus} />
        </>
      )}

      {source === 'FlatFile' && (
        <ColumnSelector
          columns={columns}
          setSelectedColumns={setSelectedColumns}
          setStatus={setStatus}
          setColumns={setColumns}
        />
      )}

      <div className="status-box">
        <StatusDisplay status={status} />
      </div>
    </div>
  );
}

export default Home;

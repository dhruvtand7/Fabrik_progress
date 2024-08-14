import React from 'react';
import { FaDownload, FaCube, FaCircle } from 'react-icons/fa';
const ImportExportButtons = ({
  handleImport,
  exportTrigger
}) => {
 

  return (
    <div className="importExportButtons">
              <input type="file" accept=".glb,.gltf" onChange={handleImport} style={{ display: 'none' }} id="importFileInput" />
              <button onClick={() => document.getElementById('importFileInput').click()} className="importButton">Import from Local</button>
              <button className="exportButton" onClick={() => { if (exportTrigger) exportTrigger(); }}><FaDownload /> Download file</button>
    </div>
  );
};

export default ImportExportButtons;

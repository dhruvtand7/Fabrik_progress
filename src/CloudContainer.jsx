import React, { useEffect, useState } from 'react';
import { ref, listAll, getDownloadURL } from '@firebase/storage';
import { storage } from './firebase';

export default function CloudContainer({ handleCloudImport }) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const storageRef = ref(storage, 'models/glb');
        const result = await listAll(storageRef);
        const fileList = await Promise.all(result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { name: itemRef.name, url };
        }));
        setFiles(fileList);
      } catch (error) {
        console.error('Error fetching files from cloud:', error);
      }
    };

    fetchFiles();

    const interval = setInterval(() => {
      fetchFiles();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (event) => {
    const selectedFileUrl = event.target.value;
    setSelectedFile(selectedFileUrl);

    if (selectedFileUrl) {
      handleCloudImport(selectedFileUrl); // Use the new function here
    }
  };

  return (
    <div className="cloud-container">
      <label htmlFor="file-select">Import a file from cloud:</label>
      <select id="file-select" value={selectedFile} onChange={handleFileChange}>
        <option value="" disabled>Select a file</option>
        {files.map((file) => (
          <option key={file.name} value={file.url}>
            {file.name}
          </option>
        ))}
      </select>
    </div>
  );
}

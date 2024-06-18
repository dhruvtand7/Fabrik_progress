// CloudContainer.jsx
import React, { useEffect, useState } from 'react';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from './firebaseConfig';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

export default function CloudContainer({ onImport }) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');

  useEffect(() => {
    const fetchFiles = async () => {
      const storageRef = ref(storage, 'models/glb'); // Updated reference to point to models/glb
      const result = await listAll(storageRef);
      const fileList = await Promise.all(result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return { name: itemRef.name, url };
      }));
      setFiles(fileList);
    };

    fetchFiles();
  }, []);

  const handleFileChange = async (event) => {
    const selectedFileUrl = event.target.value;
    setSelectedFile(selectedFileUrl);

    const loader = new GLTFLoader();
    loader.load(
      selectedFileUrl,
      (gltf) => {
        onImport(gltf.scene);
      },
      undefined,
      (error) => {
        console.error('An error happened', error);
      }
    );
  };

  return (
    <div className="cloud-container">
      <label htmlFor="file-select" >Import a file from cloud:</label>
      <select id="file-select" value={selectedFile} onChange={handleFileChange}>
        <option value="" disabled>Select a file</option>
        {files.map((file) => (
          <option key={file.name} value={file.url}>{file.name}</option>
        ))}
      </select>
    </div>
  );
}

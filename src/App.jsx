import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import './App.css';
import { OrbitControls, Stats } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

// Component to load the GLB file with Draco compression
function Scene({ onObjectClick, onObjectHover }) {
  const path = "/sample/rio.glb";
  const [highlightedMesh, setHighlightedMesh] = useState(null);

  const handlePointerOver = (e) => {
    const mesh = e.object; // Access the mesh directly
    setHighlightedMesh(mesh);
    onObjectHover(mesh);
  };
  const handlePointerOut = () => {
    setHighlightedMesh(null);
    onObjectHover(null);
  };
  return (
    <primitive
      object={useLoader(GLTFLoader, path, (loader) => {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
        loader.setDRACOLoader(dracoLoader);
      }).scene}
      onPointerUp={(e) => {
        e.stopPropagation();
        onObjectClick(e.object);
      }}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  );
}

function InfoPanel({ object, onColorChange, onMaterialChange }) {
  if (!object) return null;

  const { geometry, material } = object;

  return (
    <div className="info-panel">
      <h2>Object Info</h2>
      <p><strong>Name:</strong> {object.name}</p>
      <p><strong>Geometry:</strong> {geometry.type}</p>
      <p><strong>Material:</strong> {material ? material.type : 'None'}</p>
      <div className="material-picker">
        <h3>Select Material</h3>
        <ul>
          <li onClick={() => onMaterialChange(object, '/textures/basic.jpg')}>Basic</li>
          <li onClick={() => onMaterialChange(object, '/textures/steel.jpg')}>Steel</li>
          <li onClick={() => onMaterialChange(object, '/textures/wood.jpg')}>Wood</li>
          <li onClick={() => onMaterialChange(object, '/textures/paper.jpg')}>Paper</li>
        </ul>
      </div>
      <input
        type="color"
        value={`#${material.color.getHexString()}`}
        onChange={(e) => onColorChange(object, e.target.value)}
      />
    </div>
  );
}

export default function App() {
  const [selectedObject, setSelectedObject] = useState(null);
  const [highlightedMesh, setHighlightedMesh] = useState(null);

  const handleObjectClick = (mesh) => {
    setSelectedObject(mesh);
  };

  const handleObjectHover = (mesh) => {
    if (mesh) {
      if (mesh !== highlightedMesh) {
        if (highlightedMesh) {
          highlightedMesh.material.color.copy(highlightedMesh.originalColor);
        }

        mesh.originalColor = mesh.material.color.clone();
        const darkerColor = mesh.originalColor.clone().multiplyScalar(0.8);
        mesh.material.color = darkerColor;
        setHighlightedMesh(mesh);
      }
    } else {
      if (highlightedMesh) {
        highlightedMesh.material.color.copy(highlightedMesh.originalColor);
      }
      setHighlightedMesh(null);
    }
  };

  const handleColorChange = (object, color) => {
    object.material.color.set(color);
  };

  const handleMaterialChange = (object, texturePath) => {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(texturePath);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    object.material = material;
  };

  return (
    <>
      <Canvas camera={{ position: [-8, 3, 8] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 0, 5]} />
        <Scene onObjectClick={handleObjectClick} onObjectHover={handleObjectHover} />
        <OrbitControls />
        <Stats />
      </Canvas>
      <InfoPanel
        object={highlightedMesh || selectedObject}
        onColorChange={handleColorChange}
        onMaterialChange={handleMaterialChange}
      />
    </>
  );
}
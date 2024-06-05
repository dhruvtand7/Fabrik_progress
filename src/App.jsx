import React, { useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import './App.css';
import { OrbitControls, Stats } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';

// Component to load the GLB file with Draco compression
function Scene({ onObjectClick, onObjectHover }) {
  const path = "/sample/rio.glb";
  const gltf = useLoader(GLTFLoader, path, loader => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    loader.setDRACOLoader(dracoLoader);
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    onObjectHover(e.object);
  };

  const handlePointerOut = () => {
    onObjectHover(null);
  };

  return (
    <primitive
      object={gltf.scene}
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
  const materialTypes = [
    'MeshBasicMaterial', 'MeshDepthMaterial', 'MeshDistanceMaterial',
    'MeshLambertMaterial', 'MeshMatcapMaterial', 'MeshNormalMaterial',
    'MeshPhongMaterial', 'MeshPhysicalMaterial', 'MeshStandardMaterial',
    'MeshToonMaterial'
  ];

  const handleMaterialChange = (e) => {
    const newMaterialType = e.target.value;
    onMaterialChange(object, newMaterialType);
  };

  return (
    <div className="info-panel">
      <h2>Object Info</h2>
      <p><strong>Name:</strong> {object.name}</p>
      <p><strong>Geometry:</strong> {geometry.type}</p>
      <p><strong>Material:</strong> {material ? material.type : 'None'}</p>
      
      <input
        type="color"
        value={`#${material.color.getHexString()}`}
        onChange={(e) => onColorChange(object, e.target.value)}
      />

      <label>
        Material Type:
        <select value={material.type} onChange={handleMaterialChange}>
          {materialTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </label>
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
    if (mesh && mesh !== highlightedMesh) {
      if (highlightedMesh) {
        highlightedMesh.material.color.copy(highlightedMesh.originalColor);
      }

      mesh.originalColor = mesh.material.color.clone();
      const darkerColor = mesh.originalColor.clone().multiplyScalar(0.8);
      mesh.material.color.copy(darkerColor);
      setHighlightedMesh(mesh);
    } else if (!mesh && highlightedMesh) {
      highlightedMesh.material.color.copy(highlightedMesh.originalColor);
      setHighlightedMesh(null);
    }
  };

  const handleColorChange = (object, color) => {
    object.material.color.set(color);
  };

  const handleMaterialChange = (object, newMaterialType) => {
    const materialParams = { color: object.material.color };

    let newMaterial;
    switch (newMaterialType) {
      case 'MeshBasicMaterial':
        newMaterial = new THREE.MeshBasicMaterial(materialParams);
        break;
      case 'MeshDepthMaterial':
        newMaterial = new THREE.MeshDepthMaterial(materialParams);
        break;
      case 'MeshDistanceMaterial':
        newMaterial = new THREE.MeshDistanceMaterial(materialParams);
        break;
      case 'MeshLambertMaterial':
        newMaterial = new THREE.MeshLambertMaterial(materialParams);
        break;
      case 'MeshMatcapMaterial':
        newMaterial = new THREE.MeshMatcapMaterial(materialParams);
        break;
      case 'MeshNormalMaterial':
        newMaterial = new THREE.MeshNormalMaterial(materialParams);
        break;
      case 'MeshPhongMaterial':
        newMaterial = new THREE.MeshPhongMaterial(materialParams);
        break;
      case 'MeshPhysicalMaterial':
        newMaterial = new THREE.MeshPhysicalMaterial(materialParams);
        break;
      case 'MeshStandardMaterial':
        newMaterial = new THREE.MeshStandardMaterial(materialParams);
        break;
      case 'MeshToonMaterial':
        newMaterial = new THREE.MeshToonMaterial(materialParams);
        break;
      default:
        return;
    }

    object.material = newMaterial;
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

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

export default function App() {
  const [selectedObject, setSelectedObject] = useState(null);
  const [highlightedMesh, setHighlightedMesh] = useState(null);
  const [transparent, setTransparent] = useState(false);

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

  const handleWireframeToggle = (object) => {
    object.material.wireframe = !object.material.wireframe;
    object.material.needsUpdate = true;
  };

  const handleTransparentToggle = (object) => {
    object.material.transparent = !object.material.transparent;
    object.material.needsUpdate = true;
    setTransparent(object.material.transparent);
  };

  const handleOpacityChange = (object, opacity) => {
    if (object.material.transparent) {
      object.material.opacity = opacity;
      object.material.needsUpdate = true;
    }
  };
  
  const handleDepthTestToggle = (object) => {
    object.material.depthTest = !object.material.depthTest;
    object.material.needsUpdate = true;
  };

  const handleDepthWriteToggle = (object) => {
    object.material.depthWrite = !object.material.depthWrite;
    object.material.needsUpdate = true;
  };

  const handleAlphaHashToggle = (object) => {
    object.material.alphaHash = !object.material.alphaHash;
    object.material.needsUpdate = true;
  };

  const handleSideChange = (object, side) => {
    object.material.side = side;
    object.material.needsUpdate = true;
  };

  const handleFlatShadingToggle = (object) => {
    object.material.flatShading = !object.material.flatShading;
    object.material.needsUpdate = true;
  };

  const handleVertexColorsToggle = (object) => {
    object.material.vertexColors = object.material.vertexColors === THREE.NoColors ? THREE.VertexColors : THREE.NoColors;
    object.material.needsUpdate = true;
  };

  // InfoPanel component
  const InfoPanel = ({ object, onColorChange, onMaterialChange, onWireframeToggle, onTransparentToggle, onOpacityChange, onDepthTestToggle, onDepthWriteToggle, onAlphaHashToggle, onSideChange, onFlatShadingToggle, onVertexColorsToggle }) => {
    if (!object) return null;

    const { geometry, material } = object;
    const materialTypes = [
      'MeshBasicMaterial', 'MeshDepthMaterial', 'MeshDistanceMaterial',
      'MeshLambertMaterial', 'MeshMatcapMaterial', 'MeshNormalMaterial',
      'MeshPhongMaterial', 'MeshPhysicalMaterial', 'MeshStandardMaterial',
      'MeshToonMaterial'
    ];
    const sideOptions = [
      { label: 'Front Side', value: THREE.FrontSide },
      { label: 'Back Side', value: THREE.BackSide },
      { label: 'Double Side', value: THREE.DoubleSide }
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
        
        {material && material.color && (
          <input
            type="color"
            value={`#${material.color.getHexString()}`}
            onChange={(e) => onColorChange(object, e.target.value)}
          />
        )}
        
        <label>
          Material Type:
          <select value={material ? material.type : ''} onChange={handleMaterialChange}>
            {materialTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
                    <div className="toggle">
          <label>
            Wireframe:
            <input
              type="checkbox"
              checked={material && material.wireframe}
              onChange={() => onWireframeToggle(object)}
            />
          </label>
        </div>
        <div className="toggle">
          <label>
            Transparent:
            <input
              type="checkbox"
              checked={transparent}
              onChange={() => onTransparentToggle(object)}
            />
          </label>
        </div>
        <div className="slider">
          <label>
            Opacity:
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={material ? material.opacity : 1}
              onChange={(e) => onOpacityChange(object, parseFloat(e.target.value))}
            />
          </label>
        </div>

        <div className="toggle">
          <label>
            Depth Test:
            <input
              type="checkbox"
              checked={material && material.depthTest}
              onChange={() => onDepthTestToggle(object)}
            />
          </label>
        </div>

        <div className="toggle">
          <label>
            Depth Write:
            <input
              type="checkbox"
              checked={material && material.depthWrite}
              onChange={() => onDepthWriteToggle(object)}
            />
          </label>
        </div>

        <div className="toggle">
          <label>
            Alpha Hash:
            <input
              type="checkbox"
              checked={material && material.alphaHash}
              onChange={() => onAlphaHashToggle(object)}
            />
          </label>
        </div>

        <label>
          Side:
          <select
            value={material ? material.side : ''}
            onChange={(e) => onSideChange(object, parseInt(e.target.value))}
          >
            {sideOptions.map((option, index) => (
              <option key={index} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <div className="toggle">
          <label>
            Flat Shading:
            <input
              type="checkbox"
              checked={material && material.flatShading}
              onChange={() => onFlatShadingToggle(object)}
            />
          </label>
        </div>

        <div className="toggle">
          <label>
            Vertex Colors:
            <input
              type="checkbox"
              checked={material && material.vertexColors === THREE.VertexColors}
              onChange={() => onVertexColorsToggle(object)}
            />
          </label>
        </div>
      </div>
    );
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
        onWireframeToggle={handleWireframeToggle}
        onTransparentToggle={handleTransparentToggle}
        onOpacityChange={handleOpacityChange}
        onDepthTestToggle={handleDepthTestToggle}
        onDepthWriteToggle={handleDepthWriteToggle}
        onAlphaHashToggle={handleAlphaHashToggle}
        onSideChange={handleSideChange}
        onFlatShadingToggle={handleFlatShadingToggle}
        onVertexColorsToggle={handleVertexColorsToggle}
      />
    </>
  );
}

        
       

import React, { useState, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import './App.css';
import { OrbitControls, Stats } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';
import { saveAs } from 'file-saver';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

function Scene({ onObjectClick, onObjectHover, sceneRef }) {
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
      ref={sceneRef}
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
  const [selectedMaterialType, setSelectedMaterialType] = useState('');
  const sceneRef = useRef();

  const handleObjectClick = (mesh) => {
    setSelectedObject(mesh);
    if (mesh.material) {
      setSelectedMaterialType(mesh.material.type);
    }
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
      // Material types switch statement...
    }

    object.material = newMaterial;
    setSelectedMaterialType(newMaterialType);
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

  const handleGeometryChange = (object, newGeometry) => {
    const material = object.material;
    switch (newGeometry) {
      case 'ConeGeometry':
        object.geometry = new THREE.ConeGeometry(1, 2, 32);
        break;
      case 'BoxGeometry':
        object.geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case 'SphereGeometry':
        object.geometry = new THREE.SphereGeometry(1, 32, 32);
        break;
      default:
        return;
    }
    object.material = material; // Retain the same material
  };

  const handleSizeChange = (object, size) => {
    object.scale.set(size, size, size);
  };

  const handleExport = () => {
    const scene = sceneRef.current;
    if (scene) {
      const exporter = new GLTFExporter();
      exporter.parse(
        scene,
        (gltf) => {
          const blob = new Blob([gltf], { type: 'application/octet-stream' });
          saveAs(blob, 'scene.glb');
        },
        { binary: true }
      );
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = event.target.result;
        const gltfLoader = new GLTFLoader();
        gltfLoader.load(data, (gltf) => {
          sceneRef.current.children = [];
          sceneRef.current.add(gltf.scene);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const InfoPanel = ({ object, onColorChange, onMaterialChange, onWireframeToggle, onTransparentToggle, onOpacityChange, onDepthTestToggle, onDepthWriteToggle, onAlphaHashToggle, onSideChange, onFlatShadingToggle, onVertexColorsToggle, onGeometryChange, onSizeChange, onExport }) => {
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
    const geometryOptions = [
      { label: 'Cone', value: 'ConeGeometry' },
      { label: 'Cube', value: 'BoxGeometry' },
      { label: 'Sphere', value: 'SphereGeometry' }
    ];

    const handleMaterialChange = (e) => {
      const newMaterialType = e.target.value;
      onMaterialChange(object, newMaterialType);
    };

    const handleGeometryChange = (e) => {
      const newGeometry = e.target.value;
      onGeometryChange(object, newGeometry);
    };

    const handleSizeChange = (e) => {
      const newSize = parseFloat(e.target.value);
      onSizeChange(object, newSize);
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
          <select value={selectedMaterialType} onChange={handleMaterialChange}>
            {materialTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>

        <label>
          Geometry:
          <select onChange={handleGeometryChange}>
            {geometryOptions.map((option, index) => (
              <option key={index} value={option.value}>{option.label}</option>
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

        <div className="slider">
          <label>
            Size:
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={object.scale.x}
              onChange={handleSizeChange}
            />
          </label>
        </div>

        <button onClick={onExport}>Save and Export</button>
      </div>
    );
  };

  return (
    <>
      <div className="import-container">
        <input type="file" onChange={handleImport} />
      </div>
      <Canvas camera={{ position: [-8, 3, 8] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 0, 5]} />
        <Scene onObjectClick={handleObjectClick} onObjectHover={handleObjectHover} sceneRef={sceneRef} />
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
        onGeometryChange={handleGeometryChange}
        onSizeChange={handleSizeChange}
        onExport={handleExport}
      />
    </>
  );
  
}


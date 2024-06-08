import React, { useState, useRef, useEffect } from 'react';
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

function InfoPanel({
  object,
  onColorChange,
  onMaterialChange,
  onWireframeToggle,
  onTransparentToggle,
  onOpacityChange,
  onDepthTestToggle,
  onDepthWriteToggle,
  onAlphaHashToggle,
  onSideChange,
  onFlatShadingToggle,
  onVertexColorsToggle,
  onGeometryChange,
  onSizeChange,
  onExport,
}) {
  if (!object) return null;

  const { geometry, material, name } = object;
  const materialTypes = [
    'MeshBasicMaterial',
    'MeshLambertMaterial',
    'MeshPhongMaterial',
    'MeshStandardMaterial',
    'MeshNormalMaterial',
    'MeshPhysicalMaterial',
    'MeshToonMaterial',
    'MeshMatcapMaterial'
  ];
  const sideOptions = [
    { label: 'Front Side', value: THREE.FrontSide },
    { label: 'Back Side', value: THREE.BackSide },
    { label: 'Double Side', value: THREE.DoubleSide },
  ];
  const geometryOptions = [
    { label: 'Cone', value: 'ConeGeometry' },
    { label: 'Cube', value: 'BoxGeometry' },
    { label: 'Sphere', value: 'SphereGeometry' },
  ];

  return (
    <div className="info-panel">
      <h2>Info Panel</h2>
      <p><strong>Name:</strong> {name ? name : 'Unnamed'}</p>
      <p><strong>Type:</strong> {geometry.type}</p>
      <p><strong>Material:</strong> {material.type}</p>
      {material && (
        <div>
          <label>Color</label>
          <input
            type="color"
            value={`#${material.color ? material.color.getHexString() : 'ffffff'}`}
            onChange={(e) => onColorChange(object, e.target.value)}
          />
        </div>
      )}

      <div>
        <label>Material</label>
        <select value={material.type} onChange={(e) => onMaterialChange(object, e.target.value)}>
          {materialTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={material.wireframe}
            onChange={() => onWireframeToggle(object)}
          />
          Wireframe
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={material.transparent}
            onChange={() => onTransparentToggle(object)}
          />
          Transparent
        </label>
      </div>
      {material.transparent && (
        <div>
          <label>Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={material.opacity}
            onChange={(e) => onOpacityChange(object, parseFloat(e.target.value))}
          />
        </div>
      )}
      <div>
        <label>
          <input
            type="checkbox"
            checked={material.depthTest}
            onChange={() => onDepthTestToggle(object)}
          />
          Depth Test
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={material.depthWrite}
            onChange={() => onDepthWriteToggle(object)}
          />
          Depth Write
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={material.alphaHash}
            onChange={() => onAlphaHashToggle(object)}
          />
          Alpha Hash
        </label>
      </div>
      <div>
        <label>Side</label>
        <select
          value={material.side}
          onChange={(e) => onSideChange(object, parseInt(e.target.value))}
        >
          {sideOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={material.flatShading}
            onChange={() => onFlatShadingToggle(object)}
          />
          Flat Shading
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={material.vertexColors !== THREE.NoColors}
            onChange={() => onVertexColorsToggle(object)}
          />
          Vertex Colors
        </label>
      </div>
      <div>
        <label>Geometry</label>
        <select value={geometry.type} onChange={(e) => onGeometryChange(object, e.target.value)}>
          {geometryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Size</label>
        <input
          type="number"
          step="0.1"
          value={object.scale.x}
          onChange={(e) => onSizeChange(object, parseFloat(e.target.value))}
        />
      </div>
      <div>
        <button onClick={onExport}>Export</button>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedObject, setSelectedObject] = useState(null);
  const [highlightedMesh, setHighlightedMesh] = useState(null);
  const [transparent, setTransparent] = useState(false);
  const [selectedMaterialType, setSelectedMaterialType] = useState('');
  const [opacity, setOpacity] = useState(1);
  const sceneRef = useRef();

  useEffect(() => {
    if (selectedObject && selectedObject.material) {
      setSelectedMaterialType(selectedObject.material.type);
      setTransparent(selectedObject.material.transparent);
      setOpacity(selectedObject.material.opacity);
    }
  }, [selectedObject]);

  const handleObjectClick = (mesh) => {
    setSelectedObject(mesh);
    if (mesh.material) {
      setSelectedMaterialType(mesh.material.type);
      setTransparent(mesh.material.transparent);
      setOpacity(mesh.material.opacity);
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
    setSelectedObject({ ...object });
  };

  const handleMaterialChange = (object, newMaterialType) => {
    const materialParams = { color: object.material.color };
    let newMaterial;
    switch (newMaterialType) {
      case 'MeshBasicMaterial':
        newMaterial = new THREE.MeshBasicMaterial(materialParams);
        break;
      case 'MeshLambertMaterial':
        newMaterial = new THREE.MeshLambertMaterial(materialParams);
        break;
      case 'MeshPhongMaterial':
        newMaterial = new THREE.MeshPhongMaterial(materialParams);
        break;
      case 'MeshStandardMaterial':
        newMaterial = new THREE.MeshStandardMaterial(materialParams);
        break;
      case 'MeshNormalMaterial':
        newMaterial = new THREE.MeshNormalMaterial(materialParams);
        break;
      case 'MeshPhysicalMaterial':
        newMaterial = new THREE.MeshPhysicalMaterial(materialParams);
        break;
      case 'MeshToonMaterial':
        newMaterial = new THREE.MeshToonMaterial(materialParams);
        break;
      case 'MeshMatcapMaterial':
        newMaterial = new THREE.MeshMatcapMaterial(materialParams);
        break;
      
      default:
        return;
    }
    object.material = newMaterial;
    
    
    setSelectedMaterialType(newMaterialType);
    setSelectedObject({ ...object });
  };

  const handleWireframeToggle = (object) => {
    object.material.wireframe = !object.material.wireframe;
    object.material.needsUpdate = true;
    setSelectedObject({ ...object });
  };

  const handleTransparentToggle = (object) => {
    object.material.transparent = !object.material.transparent;
    object.material.needsUpdate = true;
    setTransparent(object.material.transparent);
    setSelectedObject({ ...object });
  };

  const handleOpacityChange = (object, opacity) => {
    if (object.material.transparent) {
      setOpacity(opacity);
      object.material.opacity = opacity;
      object.material.needsUpdate = true;
      setSelectedObject({ ...object });
    }
  };

  const handleDepthTestToggle = (object) => {
    object.material.depthTest = !object.material.depthTest;
    object.material.needsUpdate = true;
    setSelectedObject({ ...object });
  };

  const handleDepthWriteToggle = (object) => {
    object.material.depthWrite = !object.material.depthWrite;
    object.material.needsUpdate = true;
    setSelectedObject({ ...object });
  };

  const handleAlphaHashToggle = (object) => {
    object.material.alphaHash = !object.material.alphaHash;
    object.material.needsUpdate = true;
    setSelectedObject({ ...object });
  };

  const handleSideChange = (object, side) => {
    object.material.side = side;
    object.material.needsUpdate = true;
    setSelectedObject({ ...object });
  };

  const handleFlatShadingToggle = (object) => {
    object.material.flatShading = !object.material.flatShading;
    object.material.needsUpdate = true;
    setSelectedObject({ ...object });
  };

  const handleVertexColorsToggle = (object) => {
    object.material.vertexColors = object.material.vertexColors === THREE.NoColors ? THREE.VertexColors : THREE.NoColors;
    object.material.needsUpdate = true;
    setSelectedObject({ ...object });
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
    object.material = material;
    setSelectedObject({ ...object });
  };

  const handleSizeChange = (object, size) => {
    object.scale.set(size, size, size);
    setSelectedObject({ ...object });
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

  return (
    <>
      <div className="import-container">
        <input type="file" onChange={handleImport} />
      </div>
      <Canvas className="canvas-container" camera={{ position: [-8, 3, 8] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 0, 5]} />
        <Scene onObjectClick={handleObjectClick} onObjectHover={handleObjectHover} sceneRef={sceneRef} />
        <OrbitControls />
        <Stats />
      </Canvas>
      <InfoPanel
        object={selectedObject}
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

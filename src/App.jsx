// App.jsx
import React, { useState, useRef, useEffect} from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { saveAs } from 'file-saver';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import Scene from './Scene';
import InfoPanel from './InfoPanel';
import ImportContainer from './ImportContainer';
import './App.css';
import * as THREE from 'three';
import {
  Environment,
  Lightformer,
  
  PerspectiveCamera,
  ContactShadows,
  MeshReflectorMaterial,
  Reflector,
  
} from "@react-three/drei";

export default function App() {
  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedObjectState, setSelectedObjectState] = useState(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false); 
  const sceneRef = useRef();
  const selectedObjectRef = useRef(null);
  const [highlightedMesh, setHighlightedMesh] = useState(null);

  useEffect(() => {
    if (selectedObject && selectedObject.material) {
      selectedObjectRef.current = selectedObject;
    }
  }, [selectedObject]);

  const handleObjectClick = (mesh) => {
    setSelectedObject(mesh);
    setSelectedObjectState(mesh.uuid);
    setShowInfoPanel(true); 
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

  const updateSelectedObject = () => {
    setSelectedObjectState((prev) => prev + 1);
  };

  const handleColorChange = (object, color) => {
    const newMaterial = object.material.clone();
    newMaterial.color.set(color);
    object.material = newMaterial;
    updateSelectedObject();
  };

  const handleMaterialChange = (object, newMaterialType) => {
    let newMaterial;
    switch (newMaterialType) {
      case 'MeshBasicMaterial':
        newMaterial = new THREE.MeshBasicMaterial({ color: object.material.color });
        break;
      case 'MeshLambertMaterial':
        newMaterial = new THREE.MeshLambertMaterial({ color: object.material.color });
        break;
      case 'MeshPhongMaterial':
        newMaterial = new THREE.MeshPhongMaterial({ color: object.material.color });
        break;
      case 'MeshStandardMaterial':
        newMaterial = new THREE.MeshStandardMaterial({ color: object.material.color });
        break;
      case 'MeshNormalMaterial':
        newMaterial = new THREE.MeshNormalMaterial({ color: object.material.color });
        break;
      case 'MeshPhysicalMaterial':
        newMaterial = new THREE.MeshPhysicalMaterial({ color: object.material.color });
        break;
      case 'MeshToonMaterial':
        newMaterial = new THREE.MeshToonMaterial({ color: object.material.color });
        break;
      case 'MeshMatcapMaterial':
        newMaterial = new THREE.MeshMatcapMaterial({ color: object.material.color });
        break;
      default:
        newMaterial = new THREE.MeshBasicMaterial({ color: object.material.color });
    }
    object.material = newMaterial;
    updateSelectedObject();
  };

  const handleWireframeToggle = (object) => {
    const newMaterial = object.material.clone();
    newMaterial.wireframe = !newMaterial.wireframe;
    object.material = newMaterial;
    updateSelectedObject();
  };

  const handleTransparentToggle = (object) => {
    const newMaterial = object.material.clone();
    newMaterial.transparent = !newMaterial.transparent;
    object.material = newMaterial;
    updateSelectedObject();
  };

  const handleOpacityChange = (object, value) => {
    const newMaterial = object.material.clone();
    newMaterial.opacity = value;
    object.material = newMaterial;
    updateSelectedObject();
  };

  const handleDepthTestToggle = (object) => {
    const newMaterial = object.material.clone();
    newMaterial.depthTest = !newMaterial.depthTest;
    object.material = newMaterial;
    updateSelectedObject();
  };

  const handleDepthWriteToggle = (object) => {
    const newMaterial = object.material.clone();
    newMaterial.depthWrite = !newMaterial.depthWrite;
    object.material = newMaterial;
    updateSelectedObject();
  };

  const handleAlphaHashToggle = (object) => {
    const newMaterial = object.material.clone();
    newMaterial.alphaHash = !newMaterial.alphaHash;
    object.material = newMaterial;
    updateSelectedObject();
  };

  const handleSideChange = (object, value) => {
    const newMaterial = object.material.clone();
    newMaterial.side = value;
    object.material = newMaterial;
    updateSelectedObject();
  };

  const handleFlatShadingToggle = (object) => {
    const newMaterial = object.material.clone();
    newMaterial.flatShading = !newMaterial.flatShading;
    newMaterial.needsUpdate = true;
    object.material = newMaterial;
    updateSelectedObject();
  };

  const handleVertexColorsToggle = (object) => {
    const newMaterial = object.material.clone();
    newMaterial.vertexColors = newMaterial.vertexColors === THREE.NoColors ? THREE.VertexColors : THREE.NoColors;
    newMaterial.needsUpdate = true;
    object.material = newMaterial;
    updateSelectedObject();
  };

  const handleGeometryChange = (object, newGeometryType) => {
    let newGeometry;
    switch (newGeometryType) {
      case 'ConeGeometry':
        newGeometry = new THREE.ConeGeometry(1, 1, 32);
        break;
      case 'BoxGeometry':
        newGeometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case 'SphereGeometry':
        newGeometry = new THREE.SphereGeometry(1, 32, 32);
        break;
      default:
        newGeometry = new THREE.BoxGeometry(1, 1, 1);
    }
    object.geometry = newGeometry;
    updateSelectedObject();
  };

  const handleSizeChange = (object, size) => {
    object.scale.set(size, size, size);
    updateSelectedObject();
  };
  const handleCloseInfoPanel = () => {
    setShowInfoPanel(false);
    setSelectedObject(null);
  };

  const handleExport = () => {
    const exporter = new GLTFExporter();

    const options = {
      binary: true,
      trs: false,
      onlyVisible: true,
      truncateDrawRange: true,
      embedImages: true
    };

    try {
      exporter.parse(
        sceneRef.current,
        (result) => {
          const output = options.binary ? result : JSON.stringify(result, null, 2);
          const blob = new Blob([output], { type: options.binary ? 'application/octet-stream' : 'application/json' });
          saveAs(blob, 'scene.glb');
        },
        (error) => {
          console.error('An error occurred during parsing', error);
        },
        options
      );
    } catch (error) {
      console.error('An unexpected error occurred during export:', error);
    }
  };

  const handleImport = (importedScene) => {
    sceneRef.current.clear();
    sceneRef.current.add(importedScene);
  };

  return (
    <div className="App">
      <Canvas>
      <Environment background>
                    
                    <color attach="background" args={["#15151a"]} />

                    <Lightformer intensity={1.5} rotation-x={Math.PI / 2} position={[0, 4, -9]} scale={[10, 1, 1]} />
                    <Lightformer intensity={1} rotation-x={Math.PI / 2} position={[0, 4, -6]} scale={[10, 1, 1]} />
                    <Lightformer intensity={1.5} rotation-x={Math.PI / 2} position={[0, 4, -3]} scale={[10, 1, 1]} />
                    <Lightformer intensity={1} rotation-x={Math.PI / 2} position={[0, 4, 0]} scale={[10, 1, 1]} />
                    <Lightformer intensity={1.5} rotation-x={Math.PI / 2} position={[0, 4, 3]} scale={[10, 1, 1]} />
                    <Lightformer intensity={1} rotation-x={Math.PI / 2} position={[0, 4, 6]} scale={[10, 1, 1]} />
                    <Lightformer intensity={1.5} rotation-x={Math.PI / 2} position={[0, 4, 9]} scale={[10, 1, 1]} />
                    {/* Key */}
                    {/* <Lightformer form="ring" color="red" intensity={10} scale={2} position={[10, 7, 10]} onUpdate={(self) => self.lookAt(0, 0, 0)} /> */}
                    
                </Environment>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} scale={[100, 100, 1]}>
                    <planeGeometry args={[100, 100]} />
                    <MeshReflectorMaterial 
                        blur={[400, 100]}
                        resolution={1024}
                        mixBlur={1}
                        mixStrength={60}
                        depthScale={1}
                        minDepthThreshold={0.85}
                        maxDepthThreshold={1}
                        color="#101010"
                        roughness={0.7}
                        metalness={0.5}
                    />
                </mesh>
        <ambientLight />
        <directionalLight intensity={7.0}/>
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
        <Scene onObjectClick={handleObjectClick} onObjectHover={handleObjectHover} sceneRef={sceneRef} />
        <Stats />
      </Canvas>
      {showInfoPanel && (
      <InfoPanel
        object={selectedObject}
        onClose={handleCloseInfoPanel}
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
    )}
      <ImportContainer onImport={handleImport} />
    </div>
  );
}

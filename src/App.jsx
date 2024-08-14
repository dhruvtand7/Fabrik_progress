import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats, Environment, Lightformer} from '@react-three/drei';
import * as THREE from 'three';
import Model from './Model';
import KeyframesContainer from './KeyframesContainer';
import InfoPanel from './InfoPanel';
import CloudExportContainer from './CloudExportContainer';
import CloudContainer from './CloudContainer';
import './App.css';
import playImage from './assets/cssIcons/playButtonWhite.png';
import pauseImage from './assets/cssIcons/pauseButtonWhite.png';
import loopActiveImage from './assets/cssIcons/loopActive.png';
import loopInactiveImage from './assets/cssIcons/loopInactive.png';
import { Fullscreen, Root, Text } from '@react-three/uikit';
import Draggable from "react-draggable";
import InfoPanel2D from './InfoPanel2D';
import ExplosionConfetti from './components/Confetti';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { Leva } from 'leva';
import useLights from './components/LightsManager';
import Lights from './components/Lights';
import LightControls from './components/LightControls';
import { importModel } from './importUtils';
import ImportExportButtons from './ImportExportButtons';
import { FaPersonRunning } from "react-icons/fa6";

import { MdLightMode } from "react-icons/md";
import { XR, XRButton, createXRStore } from '@react-three/xr'

import { ARButton } from '@react-three/xr';

const store = createXRStore()

export default function App() {
    const [selectedObjectState, setSelectedObjectState] = useState(null);
    const [exportTrigger, setExportTrigger] = useState(null);
    const [importFile, setImportFile] = useState(null);
    const [animationControl, setAnimationControl] = useState('pause');
    const [loop, setLoop] = useState(false);
    const [availableAnimations, setAvailableAnimations] = useState([]);
    const [selectedAnimations, setSelectedAnimations] = useState([]);
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [showInfoPanel2D, setShowInfoPanel2D] = useState(false);
    const selectedObjectRef = useRef(null);
    const [customAnimations, setCustomAnimations] = useState({});
    const [highlightedMesh, setHighlightedMesh] = useState(null);
    const modelRef = useRef(null);
    const [selectedObject, setSelectedObject] = useState(null);
    const [isExploding, setIsExploding] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const [showAnimationsPanel, setShowAnimationsPanel] = useState(false);
    const [showInfoPanel3D, setShowInfoPanel3D] = useState(false);
    const [showLightingPanel, setShowLightingPanel] = useState(false);
    const [showAR, setShowAR] = useState(false);
    const [showVR, setShowVR] = useState(false);

    useEffect(() => {
        if (selectedObject && selectedObject.material) {
          selectedObjectRef.current = selectedObject;
        }
      }, [selectedObject]);

      const handleImport = (event) => {
        const file = event.target.files[0];
        if (file) {
          setImportFile(file);
        }
      };
      
      const handleCloudImport = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            
            // Create a Blob from the ArrayBuffer
            const blob = new Blob([arrayBuffer], { type: 'model/gltf-binary' });
            const file = new File([blob], 'model.glb', { type: 'model/gltf-binary' });
    
            // Use the imported model function
            importModel(
                file,
                (gltf) => {
                    console.log('Model imported successfully:', gltf);
                    handleImport({ target: { files: [file] } }); // Mocking event for handleImport
                },
                undefined,
                (error) => {
                    console.error('An error happened', error);
                }
            );
        } catch (error) {
            console.error('An error happened while fetching the file', error);
        }
    };
    
    const handleObjectClick = (mesh) => {
        setSelectedObject(mesh);
        setSelectedObjectState(mesh.uuid);
        setShowInfoPanel(true);
        setShowInfoPanel2D(true);
      };

    const {
      lights,
      globalExposure,
      addLight,
      updateLight,
      deleteLight,
      resetLights,
      toggleGlobalShadows,
      globalShadows,
      updateGlobalExposure,
      expandedLightId,
      setExpandedLightId,
    } = useLights();

    const togglePlayPause = () => {
        setAnimationControl(prev => (prev === 'play' ? 'pause' : 'play'));
    };

    const handleAnimationSelect = (animationName) => {
        setSelectedAnimations(prev => {
            if (prev.includes(animationName)) {
                return prev.filter(name => name !== animationName);
            } else {
                return [...prev, animationName];
            }
        });
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

    const handleAddNewAnimation = (newAnimation) => {
        setAvailableAnimations(prev => [...prev, newAnimation.name]);
        setCustomAnimations(prev => ({
            ...prev,
            [newAnimation.name]: newAnimation
        }));
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
        
      };

    const handleCloseInfoPanel2D = () => {
        setShowInfoPanel2D(false);
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
                modelRef.current,
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

    const showSuccessMessageAndConfetti = () => {
        setShowSuccessMessage(true);
        setIsExploding(true);
        setTimeout(() => {
          setIsExploding(false);
          setShowSuccessMessage(false);
        }, 5000);
    };

    return (
        <div className="app-container">
          
            <div className="canvas-container">
            
                <Canvas camera={{ position: [-8, 5, 8] }}
                gl={{ logarithmicDepthBuffer: true, antialias: false }}
                dpr={[1, 1.5]}
                >
                  <XR store={store}>
                    <Lights lights={lights} globalExposure={globalExposure} />
                    <gridHelper/>
                    
                    <ambientLight intensity={5} />
                    <directionalLight position={[0, 10, 5]} intensity={1} />
                    <Environment preset="city" />
                    <Environment background>
                      <color attach="background" args={["#212e42"]} />
                      <Lightformer intensity={1.5} rotation-x={Math.PI / 2} position={[0, 4, -9]} scale={[10, 1, 1]} />
                      <Lightformer intensity={1} rotation-x={Math.PI / 2} position={[0, 4, -6]} scale={[10, 1, 1]} />
                      <Lightformer intensity={1.5} rotation-x={Math.PI / 2} position={[0, 4, -3]} scale={[10, 1, 1]} />
                      <Lightformer intensity={1} rotation-x={Math.PI / 2} position={[0, 4, 0]} scale={[10, 1, 1]} />
                      <Lightformer intensity={1.5} rotation-x={Math.PI / 2} position={[0, 4, 3]} scale={[10, 1, 1]} />
                      <Lightformer intensity={1} rotation-x={Math.PI / 2} position={[0, 4, 6]} scale={[10, 1, 1]} />
                      <Lightformer intensity={1.5} rotation-x={Math.PI / 2} position={[0, 4, 9]} scale={[10, 1, 1]} />
                    </Environment>
                    
                
                    <Model
                        ref={modelRef}
                        setExportTrigger={setExportTrigger}
                        importFile={importFile}
                        animationControl={animationControl}
                        loop={loop}
                        selectedAnimations={selectedAnimations}
                        customAnimations={customAnimations}
                        setAvailableAnimations={setAvailableAnimations}
                        onObjectClick={handleObjectClick}
                        onObjectHover={handleObjectHover}
                        highlightedMesh={highlightedMesh}
                    />
                    <ExplosionConfetti isExploding={isExploding} />
                    {showSuccessMessage && (
                      <Root>
                          <Text position={[0, 5, 0]} fontSize={2} color="white">
                              Model Saved Successfully
                          </Text>
                      </Root>
                    )}
                    <group position={[0, -3, 4]}>
                      <Root sizeX={2} sizeY={7} sizeZ={7} flexDirection="column">
                          <CloudExportContainer modelRef={modelRef} onSuccess={showSuccessMessageAndConfetti} />
                      </Root>
                    </group>
                    <group position={[3, 1, 4]}>
                      <Root sizeX={2.5} sizeY={10} sizeZ={7} flexDirection="column">
                        {showInfoPanel && (
                          <InfoPanel
                            object={selectedObject}
                            
                          />
                        )}
                      </Root>
                    </group>
                    <OrbitControls />
                    
                    </XR>
                </Canvas>
                <div className='ARVR'>
                <button onClick={() => store.enterAR()}>Enter AR</button>
                <button onClick={() => store.enterVR()}>Enter VR</button>
                </div>
            </div>
            {showLightingPanel && (
              <LightControls
                lights={lights}
                updateLight={updateLight}
                setExpandedLightId={setExpandedLightId}
                expandedLightId={expandedLightId}
                addLight={addLight}
                deleteLight={deleteLight}
                resetLights={resetLights}
                toggleGlobalShadows={toggleGlobalShadows}
                globalShadows={globalShadows}
                globalExposure={globalExposure}
                updateGlobalExposure={updateGlobalExposure}
              />
            )}
            <div>
              <input type='file' onChange={handleImport}></input>
            <CloudContainer handleCloudImport={handleCloudImport}
            />
            </div>
              
            
            {showAnimationsPanel && (
              <KeyframesContainer
                handleImport={handleImport}
                exportTrigger={exportTrigger}
                togglePlayPause={togglePlayPause}
                animationControl={animationControl}
                playImage={playImage}
                pauseImage={pauseImage}
                loop={loop}
                setLoop={setLoop}
                loopActiveImage={loopActiveImage}
                loopInactiveImage={loopInactiveImage}
                availableAnimations={availableAnimations}
                selectedAnimations={selectedAnimations}
                handleAnimationSelect={handleAnimationSelect}
                onAddNewAnimation={handleAddNewAnimation}
              />
            )}
            <ImportExportButtons
              handleImport={handleImport}
              exportTrigger={exportTrigger}
            />

            {showInfoPanel2D && (
              <InfoPanel2D
                object={selectedObject}
                onColorChange={handleColorChange}
                onMaterialChange={handleMaterialChange}
                onTransparentToggle={handleTransparentToggle}
                onOpacityChange={handleOpacityChange}
                onDepthTestToggle={handleDepthTestToggle}
                onDepthWriteToggle={handleDepthWriteToggle}
                onAlphaHashToggle={handleAlphaHashToggle}
                onFlatShadingToggle={handleFlatShadingToggle}
                onVertexColorsToggle={handleVertexColorsToggle}
                onGeometryChange={handleGeometryChange}
                onSideChange={handleSideChange}
                onClose={handleCloseInfoPanel2D}
                onSizeChange={handleSizeChange}
                onWireframeToggle={handleWireframeToggle}
              />
            )}

            <div className="button-container">
              <button onClick={() => setShowAnimationsPanel(prev => !prev)}>
              <FaPersonRunning />
              </button>
              
              <button onClick={() => setShowLightingPanel(prev => !prev)}>
              <MdLightMode />
              </button>
            </div>
        </div>
    );
}

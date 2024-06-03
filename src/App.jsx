import React, { useRef, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import './App.css';
import { OrbitControls, Stats } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// Component to load the GLB file with Draco compression
function Scene() {
  const path = "/sample/skibidi.glb"
  const gltf = useLoader(GLTFLoader, path, (loader) => {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
    loader.setDRACOLoader(dracoLoader)
})
  return <primitive object={gltf.scene} />
}

export default function App() {
  return (
    <>
      <Canvas camera={{ position: [-8, 3, 8] }}>
        <ambientLight intensity={1.0} />
        <directionalLight color="red" position={[0, 0, 5]} />
        <Scene />
        <OrbitControls />
        <Stats />
      </Canvas>
    </>
  );
}

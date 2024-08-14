import React, { useState } from 'react';
import { ref, uploadBytesResumable } from '@firebase/storage';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import * as THREE from 'three';
import { storage } from './firebase.jsx';
import { Button } from './components/apfel/button';
import { Container, Text } from '@react-three/uikit';
import { Input } from './components/apfel/input';

const CloudExportContainer = ({ modelRef, customAnimations, onSuccess }) => {
  const [fileName, setFileName] = useState('');

  const resetToInitialFrame = (model) => {
    if (model) {
      model.position.set(0, 0, 0);
      model.scale.set(1, 1, 1);
      model.quaternion.set(0, 0, 0, 1);
    } else {
      console.error('Model is not available for resetting.');
    }
  };

  const handleExport = () => {
    if (!fileName) {
      alert('Please enter a file name');
      return;
    }

    const model = modelRef.current?.getModel(); // Ensure getModel is called if modelRef.current exists

    if (!model) {
      console.error('Model is not available for export.');
      alert('Model is not ready for export. Please try again in a moment.');
      return;
    }

    console.log('Exporting model:', model);

    resetToInitialFrame(model);

    const existingAnimations = model.animations || [];
    const allAnimations = [
      ...existingAnimations,
      ...Object.keys(customAnimations || {}).map(name => {
        const anim = customAnimations[name];
        return new THREE.AnimationClip(
          name,
          anim.duration,
          [
            new THREE.VectorKeyframeTrack(
              'myModel.position',
              [0, anim.duration],
              [0, 0, 0, ...anim.position]
            ),
            new THREE.VectorKeyframeTrack(
              'myModel.scale',
              [0, anim.duration],
              [1, 1, 1, ...anim.scale]
            ),
            new THREE.QuaternionKeyframeTrack(
              'myModel.quaternion',
              [0, anim.duration],
              [
                0, 0, 0, 1,
                ...new THREE.Quaternion().setFromEuler(new THREE.Euler(...anim.rotation.map(r => r * (Math.PI / 180)))).toArray()
              ]
            )
          ]
        );
      })
    ];

    const gltfExporter = new GLTFExporter();
    const exportScene = new THREE.Scene();
    model.traverse((child) => {
      exportScene.add(child.clone());
    });

    gltfExporter.parse(exportScene, async (result) => {
      try {
        let file;
        let fileExtension;
        if (result instanceof ArrayBuffer) {
          file = new Blob([result], { type: 'text/plain' }); // Change MIME type to text/plain
          fileExtension = 'glb';
        } else {
          const output = JSON.stringify(result, null, 2);
          file = new Blob([output], { type: 'text/plain' }); // Change MIME type to text/plain
          fileExtension = 'gltf';
        }

        const storageRef = ref(storage, `models/glb/${fileName}.${fileExtension}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            console.error(`Error uploading ${fileExtension.toUpperCase()} file:`, error);
            alert('Error uploading file. Please try again.');
          },
          () => {
            console.log(`${fileExtension.toUpperCase()} file uploaded successfully`);
            onSuccess();
            setFileName('');
          }
        );
      } catch (error) {
        console.error('Error exporting or uploading file:', error);
        alert('Error exporting or uploading file. Please try again.');
      }
    }, {
      binary: false,
      animations: allAnimations,
      trs: false,
      onlyVisible: true,
      truncateDrawRange: true,
      embedImages: true,
      maxTextureSize: 1024
    });
  };

  return (
    <Container flexDirection="column" md={{ flexDirection: 'row' }} gap={32} positionBottom={85}>
      <Input 
        placeholder="Enter file name" 
        value={fileName} 
        onValueChange={setFileName}
      />
      <Button Variant="icon" onClick={handleExport} size="lg" backgroundColor={'grey'} backgroundOpacity={0.35}>
        <Text>Save File</Text>
      </Button>
    </Container>
  );
};

export default CloudExportContainer;

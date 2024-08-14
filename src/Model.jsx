import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { importModel } from './importUtils';

const Model = forwardRef(({
                              setExportTrigger,
                              importFile,
                              animationControl,
                              loop,
                              selectedAnimations,
                              customAnimations,
                              setAvailableAnimations,
                              onObjectClick, 
                              onObjectHover
                          }, ref) => {
    const groupRef = useRef();
    const { scene } = useThree();
    const [mixer] = useState(() => new THREE.AnimationMixer());
    const clock = new THREE.Clock();
    const [actions, setActions] = useState({});
    const [modelLoaded, setModelLoaded] = useState(false);
    const [pausedAt, setPausedAt] = useState(0);
    const modelRef = useRef(null);
    const handlePointerOver = (e) => {
        e.stopPropagation();
        onObjectHover(e.object);
      };
    
      const handlePointerOut = () => {
        onObjectHover(null);
      };

    useImperativeHandle(ref, () => ({
        getModel: () => modelRef.current
    }));

    const resetToInitialFrame = () => {
        if (modelRef.current) {
            const model = modelRef.current;
            model.position.set(0, 0, 0);
            model.scale.set(1, 1, 1);
            model.quaternion.set(0, 0, 0, 1);
        }
    };

    useEffect(() => {
        if (groupRef.current && importFile) {
            while (groupRef.current.children.length) {
                groupRef.current.remove(groupRef.current.children[0]);
            }

            importModel(importFile, (gltf) => {
                const model = gltf.scene;
                model.name = 'myModel';
                groupRef.current.add(model);
                modelRef.current = model;

                model.position.set(0, 0, 0);
                model.scale.set(1, 1, 1);
                model.quaternion.set(0, 0, 0, 1);

                const existingAnimations = gltf.animations || [];
                const newActions = {};

                existingAnimations.forEach(animation => {
                    const action = mixer.clipAction(animation, model);
                    action.loop = loop ? THREE.LoopRepeat : THREE.LoopOnce;
                    action.clampWhenFinished = !loop;
                    newActions[animation.name] = action;
                });

                // Add custom animations
                Object.keys(customAnimations).forEach(name => {
                    const anim = customAnimations[name];
                    const positionKF = new THREE.VectorKeyframeTrack(
                        'myModel.position',
                        [0, anim.duration],
                        [0, 0, 0, ...anim.position]
                    );
                    const scaleKF = new THREE.VectorKeyframeTrack(
                        'myModel.scale',
                        [0, anim.duration],
                        [1, 1, 1, ...anim.scale]
                    );
                    const rotationKF = new THREE.QuaternionKeyframeTrack(
                        'myModel.quaternion',
                        [0, anim.duration],
                        [
                            0, 0, 0, 1,
                            ...new THREE.Quaternion().setFromEuler(new THREE.Euler(...anim.rotation.map(r => r * (Math.PI / 180)))).toArray()
                        ]
                    );
                    const customClip = new THREE.AnimationClip(name, anim.duration, [positionKF, scaleKF, rotationKF]);
                    const customAction = mixer.clipAction(customClip, model);
                    customAction.loop = loop ? THREE.LoopRepeat : THREE.LoopOnce;
                    customAction.clampWhenFinished = !loop;
                    newActions[name] = customAction;
                });

                setActions(newActions);
                setModelLoaded(true);

                // Update available animations
                const animationNames = [...existingAnimations.map(anim => anim.name), ...Object.keys(customAnimations)];
                setAvailableAnimations(animationNames);

                setExportTrigger(() => () => handleExport(model, gltf, existingAnimations, customAnimations));
            });
        }
    }, [importFile, mixer, setExportTrigger, loop, customAnimations, setAvailableAnimations]);

    useFrame(() => {
        const delta = clock.getDelta();
        if (animationControl === 'play') {
            mixer.update(delta);
        } else if (animationControl === 'pause') {
            mixer.update(0);
        }
    });

    useEffect(() => {
        if (modelLoaded) {
            if (animationControl === 'play') {
                Object.keys(actions).forEach(name => {
                    if (selectedAnimations.includes(name)) {
                        actions[name].paused = false;
                        actions[name].play();
                    }
                });
                mixer.timeScale = 1;
            } else if (animationControl === 'pause') {
                setPausedAt(mixer.time);
                mixer.timeScale = 0;
                Object.keys(actions).forEach(name => {
                    actions[name].paused = true;
                });
            }
        }
    }, [animationControl, actions, selectedAnimations, modelLoaded, mixer]);

    const handleExport = (model, gltf, existingAnimations, customAnimations) => {
        resetToInitialFrame();

        const allAnimations = [
            ...existingAnimations,
            ...Object.keys(customAnimations).map(name => {
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

        const options = {
            binary: true,
            animations: allAnimations,
        };

        const link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);
        function save(blob, filename) {
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        }
        function saveString(text, filename) {
            save(new Blob([text], { type: 'text/plain' }), filename);
        }
        function saveArrayBuffer(buffer, filename) {
            save(new Blob([buffer], { type: 'application/octet-stream' }), filename);
        }

        // Create a new array to hold the children that we want to export
        const objectsToExport = [];

        // Traverse the scene and add only the model to the array
        scene.traverse((child) => {
            if (child === model) {
                objectsToExport.push(child);
            }
        });

        // Create a new scene for export and add only the model
        const exportScene = new THREE.Scene();
        objectsToExport.forEach((object) => {
            exportScene.add(object);
        });

        gltfExporter.parse(exportScene, function (result) {
            if (result instanceof ArrayBuffer) {
                saveArrayBuffer(result, 'Exported.glb');
            } else {
                const output = JSON.stringify(result, null, 2);
                console.log(output);
                saveString(output, 'Exported.gltf');
            }
        }, function (error) {
            console.error('An error occurred during the export:', error);
        }, options);
    };

    return (
        <group
      ref={groupRef}
    
      onPointerUp={(e) => {
        e.stopPropagation();
        onObjectClick(e.object);
      }}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />

        
    );
});

export default Model;

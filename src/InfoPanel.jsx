// InfoPanel.jsx
import { Container, Text } from '@react-three/uikit';
import React from 'react';
import * as THREE from 'three';
import { Button } from './components/apfel/button';
import { Card } from './components/apfel/card';
import { Tabs, TabsButton } from './components/apfel/tabs';
import { TabBar, TabBarItem } from './components/apfel/tab-bar';
import { Slider } from './components/apfel/slider';
import { Checkbox } from './components/apfel/checkbox';
import {AlignVerticalSpaceBetween, 
        AlignVerticalDistributeStart, 
        AlignVerticalDistributeEnd,
        Cone, 
        Box,
        Circle,
        Scaling,
        Download

        
      } from '@react-three/uikit-lucide';


function InfoPanel({
  object,
  onClose,
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
  handleExport,
  exportTrigger
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
    { label: 'Front Side', value: THREE.FrontSide, ico: <AlignVerticalDistributeStart /> },
    { label: 'Back Side', value: THREE.BackSide, ico: <AlignVerticalDistributeEnd/> },
    { label: 'Double Side', value: THREE.DoubleSide, ico: <AlignVerticalSpaceBetween /> }
  ];
  const geometryOptions = [
    { label: 'Cone', value: 'ConeGeometry', ico:<Cone/> },
    { label: 'Cube', value: 'BoxGeometry', ico:<Box/>},
    { label: 'Sphere', value: 'SphereGeometry', ico: <Circle/>},
  ];

  return (
    <group>
      <Card positionRight={600} positionTop={400} borderRadius={32} padding={16} gap={8} flexDirection="column" overflow={'hidden'}>
        <Container className="info-close">
          <Button className="close-button" onClick={onClose}>
            <Text>Hide options</Text>
          </Button>
        </Container>
        
        <Container flexDirection="column">
          <Text fontSize={25}>{name ? name : 'Unnamed'}</Text>
          <Text fontSize={18} opacity={0.5}>Type:</Text>
          <Text fontSize={14}>{geometry.type}</Text>
          <Text fontSize={18} opacity={0.5}>Material:</Text>
          <Text fontSize={14}>{material.type}</Text>
        </Container>
      </Card>
     </group>  
  );
}

export default InfoPanel;



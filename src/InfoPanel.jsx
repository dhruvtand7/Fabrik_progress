// InfoPanel.jsx
import React from 'react';
import * as THREE from 'three';

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
      <div className="info-close">
        <button className="close-button" onClick={onClose}>
            X
        </button>
      </div>
      <div className="info-header">
        
        <h2>Info Panel</h2>
        
      </div>

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

export default InfoPanel;
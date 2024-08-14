import React, { useState } from 'react';
import * as THREE from 'three';
import { FaDownload, FaCube, FaCircle } from 'react-icons/fa';
import { TbConeFilled } from "react-icons/tb";
import { AiOutlineAlignLeft, AiOutlineAlignRight, AiOutlineAlignCenter } from 'react-icons/ai';
import { FaPaintBrush } from "react-icons/fa";

function InfoPanel2D({
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
  onExport
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
    { label: 'Front Side', value: THREE.FrontSide, ico: <AiOutlineAlignLeft /> },
    { label: 'Back Side', value: THREE.BackSide, ico: <AiOutlineAlignRight /> },
    { label: 'Double Side', value: THREE.DoubleSide, ico: <AiOutlineAlignCenter /> }
  ];

  const geometryOptions = [
    { label: 'Cone', value: 'ConeGeometry', ico: <TbConeFilled /> },
    { label: 'Cube', value: 'BoxGeometry', ico: <FaCube /> },
    { label: 'Sphere', value: 'SphereGeometry', ico: <FaCircle /> }
  ];

  // State to track selected option
  const [selectedSide, setSelectedSide] = useState(material.side);
  const [selectedGeometry, setSelectedGeometry] = useState(geometry.type);

  const handleSideChange = (value) => {
    setSelectedSide(value);
    onSideChange(object, value);
  };

  const handleGeometryChange = (value) => {
    setSelectedGeometry(value);
    onGeometryChange(object, value);
  };

  return (
    <div className="info-panel">
      <div className="info-close">
        <button className="close-button" onClick={onClose}>
          X
        </button>
      </div>
      <div className="info-header">
      <FaPaintBrush fontSize={50}/>
        
        
      </div>

      <p><strong>Name:</strong> {name ? name : 'Unnamed'}</p>
      <p><strong>Type:</strong> {geometry.type}</p>
      <p><strong>Material:</strong> {material.type}</p>

      {material && (
        <div>
          <label className='colorlabel'>
            Color
            <input
              type="color"
              value={`#${material.color ? material.color.getHexString() : 'ffffff'}`}
              onChange={(e) => onColorChange(object, e.target.value)}
            />
          </label>
        </div>
      )}

      <div>
        <label>
          Material
          <select value={material.type} onChange={(e) => onMaterialChange(object, e.target.value)}>
            {materialTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
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
          <label>
            Opacity
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={material.opacity}
              onChange={(e) => onOpacityChange(object, parseFloat(e.target.value))}
            />
          </label>
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

      <div className="option-group">
        <label>Side</label>
        <div className="options">
          {sideOptions.map((option) => (
            <div
              key={option.value}
              className={`option ${selectedSide === option.value ? 'selected' : ''}`}
              onClick={() => handleSideChange(option.value)}
            >
              {option.ico}
            </div>
          ))}
        </div>
      </div>

      <div className="option-group">
        <label>Geometry</label>
        <div className="options">
          {geometryOptions.map((option) => (
            <div
              key={option.value}
              className={`option ${selectedGeometry === option.value ? 'selected' : ''}`}
              onClick={() => handleGeometryChange(option.value)}
            >
              {option.ico}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label>
          Size
          <input
            type="number"
            step="0.1"
            value={object.scale.x}
            onChange={(e) => onSizeChange(object, parseFloat(e.target.value))}
          />
        </label>
      </div>

      <div>
        <button onClick={() => onExport()}>
          <FaDownload /> Download file
        </button>
      </div>
    </div>
  );
}

export default InfoPanel2D;

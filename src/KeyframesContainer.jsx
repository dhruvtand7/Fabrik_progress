import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { ref, listAll, getDownloadURL } from '@firebase/storage';
import { storage } from './firebase'; // Import your Firebase storage configuration
import { importModel } from './importUtils';

const KeyframesContainer = ({
  handleImport,
  exportTrigger,
  togglePlayPause,
  animationControl,
  playImage,
  pauseImage,
  loop,
  setLoop,
  loopActiveImage,
  loopInactiveImage,
  availableAnimations,
  selectedAnimations,
  handleAnimationSelect,
  onAddNewAnimation,
  handleExport
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newAnimation, setNewAnimation] = useState({
    name: '',
    position: [0, 0, 0],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    duration: 5
  });

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');

  

    

  const handleInputChange = (e, type, index) => {
    const value = type === 'name' ? e.target.value : parseFloat(e.target.value);
    setNewAnimation(prev => {
      const updated = { ...prev };
      if (type === 'position' || type === 'scale' || type === 'rotation') {
        updated[type][index] = value;
      } else {
        updated[type] = value;
      }
      return updated;
    });
  };

  const handleAddAnimation = () => {
    onAddNewAnimation(newAnimation);
    setIsExpanded(false);
  };

  


  return (
    <Draggable>
      <div className={`input-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div>
          <div className="keyframeTitleStuff">Animations Controllers</div>

          <button className="closeButton" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Close' : 'Add Animation'}
          </button>

          <div className="buttonFunctionalities">
            
            <div className="playLoopButtons">
              <button onClick={togglePlayPause} className="playButton">
                <img src={animationControl === 'play' ? pauseImage : playImage} alt={animationControl === 'play' ? 'Pause' : 'Play'} style={{ height: '12px' }} />
              </button>
              <button onClick={() => setLoop(!loop)} className="loopButton">
                <img src={loop ? loopActiveImage : loopInactiveImage} alt={loop ? 'Loop: On' : 'Loop: Off'} style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
          </div>

          

          <div className="animation-selector">
            <div className="animationsListTitle">
              <span>AVAILABLE ANIMATIONS</span>
              <div className="image-container">
                <img src="https://www.svgrepo.com/show/371686/animation.svg" alt="Animation Icon" width="12" height="12" />
              </div>
            </div>
            <div className="animation-list">
              {availableAnimations.map(animation => (
                <label key={animation} className="animationsCollection">
                  <input
                    type="checkbox"
                    checked={selectedAnimations.includes(animation)}
                    onChange={() => handleAnimationSelect(animation)}
                  />
                  <span></span> {animation}
                </label>
              ))}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="expanded-content">
            <div className="inputs">
              <label>
                ANIMATION NAME:
                <input
                  type="text"
                  placeholder="Name"
                  value={newAnimation.name}
                  onChange={(e) => handleInputChange(e, 'name')}
                  style={{ width: '230px' }}
                />
              </label>
              <label>
                POSITION:
                <div className="input-group">
                  <input
                    type="number"
                    placeholder="X"
                    value={newAnimation.position[0]}
                    onChange={(e) => handleInputChange(e, 'position', 0)}
                  />
                  <input
                    type="number"
                    placeholder="Y"
                    value={newAnimation.position[1]}
                    onChange={(e) => handleInputChange(e, 'position', 1)}
                  />
                  <input
                    type="number"
                    placeholder="Z"
                    value={newAnimation.position[2]}
                    onChange={(e) => handleInputChange(e, 'position', 2)}
                  />
                </div>
              </label>
              <label>
                SCALE:
                <div className="input-group">
                  <input
                    type="number"
                    placeholder="X"
                    value={newAnimation.scale[0]}
                    onChange={(e) => handleInputChange(e, 'scale', 0)}
                  />
                  <input
                    type="number"
                    placeholder="Y"
                    value={newAnimation.scale[1]}
                    onChange={(e) => handleInputChange(e, 'scale', 1)}
                  />
                  <input
                    type="number"
                    placeholder="Z"
                    value={newAnimation.scale[2]}
                    onChange={(e) => handleInputChange(e, 'scale', 2)}
                  />
                </div>
              </label>
              <label>
                ROTATION:
                <div className="input-group">
                  <input
                    type="number"
                    placeholder="X"
                    value={newAnimation.rotation[0]}
                    onChange={(e) => handleInputChange(e, 'rotation', 0)}
                  />
                  <input
                    type="number"
                    placeholder="Y"
                    value={newAnimation.rotation[1]}
                    onChange={(e) => handleInputChange(e, 'rotation', 1)}
                  />
                  <input
                    type="number"
                    placeholder="Z"
                    value={newAnimation.rotation[2]}
                    onChange={(e) => handleInputChange(e, 'rotation', 2)}
                  />
                </div>
              </label>
            </div>
            <div className="duration-buttons">
              <label>
                DURATION:
                <input
                  type="number"
                  placeholder="Duration"
                  value={newAnimation.duration}
                  onChange={(e) => handleInputChange(e, 'duration')}
                />
              </label>
              <div className="buttons">
                <button className="addButton" onClick={handleAddAnimation}>Add</button>
                <button className="cancelAdditionButton" onClick={() => setIsExpanded(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Draggable>
  );
};

export default KeyframesContainer;

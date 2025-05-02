import React from 'react';

const Locker = ({ locker, onClick, isSelected }) => {
  return (
    <div 
      className={`locker-container ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(locker.id)}
    >
      <div className="locker-image-container">
        <img 
          src="../public/locker.png" 
          className="locker-image" 
          alt={`locker ${locker.id}`}
          onError={(e) => {
            console.error("Image failed to load:", e);
            e.target.style.height = "100%";
            e.target.style.width = "auto";
          }}
        />
        
        {/* Position text overlays within the image */}
        {locker.player && (
          <div className="locker-label">
            {locker.player}
          </div>
        )}
        {locker.match && (
          <div className="locker-date">
            {locker.match}
          </div>
        )}
      </div>
    </div>
  );
};

export default Locker;
import React from 'react';

const Door = ({ door, onClick, isSelected }) => {
    return (
      <div 
        key={door.id} 
        onClick={() => onClick(door.id)}
        className={`door-wrapper ${isSelected ? 'selected' : ''}`}
      >
        <img src='../public/locker-door.png' className='door-image' alt="Door" />
        <div className={`door ${door.color}`}>
          <div className="door-handle"></div>
        </div>
        <div className="door-label">
          {door.team}
        </div>
      </div>
    );
  };
  
  export default Door;
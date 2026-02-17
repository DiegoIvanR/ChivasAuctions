
// Door.jsx - Asegurémonos que el componente Door maneja correctamente las etiquetas
import React from 'react';

const Door = ({ door, onClick, isSelected }) => {
  return (
    <div 
      className={`door-container ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(door.id)}
    >
      <img 
        src="../locker-door.png" 
        className="door-image" 
        alt={`Door ${door.id}`} 
      />
      <div className='door-info'>
        {door.opponent && (
          <div className="door-label">
            {door.opponent}
          </div>
        )}
        {door.opponent && (
          <div className="door-date">
            {door.match_date}
          </div>
        )}
      </div>
    </div>
  );
};

export default Door;
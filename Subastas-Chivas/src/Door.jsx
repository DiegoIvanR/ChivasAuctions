
// Door.jsx - Asegurémonos que el componente Door maneja correctamente las etiquetas
import React from 'react';

const Door = ({ door, onClick, isSelected }) => {
  return (
    <div 
      className={`door-container ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(door.id)}
    >
      <img 
        src="../public/locker-door.png" 
        className="door-image" 
        alt={`Door ${door.id}`} 
      />
      {door.team && (
        <div className="door-label">
          {door.team}
        </div>
      )}
    </div>
  );
};

export default Door;
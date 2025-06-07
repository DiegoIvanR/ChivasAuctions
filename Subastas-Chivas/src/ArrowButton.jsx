import React from 'react';

const ArrowButton = ({ direction, onClick, disabled }) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className="circle-button"
      style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: '#E6272E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.3s',
        position: 'relative',
        zIndex: 2,
        opacity: disabled ? 0.5 : 1
      }}
    >
      <span 
        className={`arrow ${direction}`}
        style={{
          position: 'absolute',
          width: '1rem',
          height: '1rem',
          border: 'solid #FFFFFF',
          borderWidth: '0 6px 6px 0',
          display: 'inline-block',
          transition: 'transform 0.3s ease',
          padding: '3px',
          transform: direction === 'left' ? 'rotate(135deg)' : 'rotate(-45deg)',
          zIndex: 3,
          top: '40%'
        }}
      />
    </button>
  );
};
  
  export default ArrowButton;
import React from 'react';

const ArrowButton = ({ direction, onClick, disabled }) => {
    return (
      <button 
        onClick={onClick} 
        disabled={disabled}
        className="circle-button"
      >
        <span className={`arrow ${direction}`} />
      </button>
    );
  };
  
  export default ArrowButton;
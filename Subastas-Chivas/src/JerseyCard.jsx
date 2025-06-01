import React from 'react';

const JerseyCard = ({ jersey }) => {
  return (
    <div className="stat-card jersey-card animate-pop-in">
      <img
        src={jersey.img_src.replace('../public', '')}
        alt={jersey.player}
        className="jersey-image"
      />
      <div className="jersey-info">
        <h3>{jersey.player}</h3>
        <p>PUJA GANADORA</p>
        <p className="price">${jersey.highest_bid}</p>
        <div className="tags">
          {jersey.used && <span className="tag">USADA</span>}
          {jersey.signed && <span className="tag">FIRMADA</span>}
        </div>
        <p className="estado">Terminado</p>
      </div>
    </div>
  );
};

export default JerseyCard;
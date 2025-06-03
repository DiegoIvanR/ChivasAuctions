import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Confirmation.css'; 

const AuctionConfirmation = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/dashboard-auction');
  };

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <h2 className="confirmation-title">CONFIRMACIÓN</h2>
        <h3 className="confirmation-subtitle">#14 Javier Hernández</h3>

        <div className="confirmation-grid">
          <div className="left">
            <p><strong>Playera usada:</strong> Sí</p>
            <p><strong>Monto inicial:</strong> $1000 MXN</p>
            <p><strong>Fecha:</strong> 16/8/2025</p>
            <p><strong>Liga:</strong> Liga MX</p>
            <p><strong>Fase:</strong> Cuartos de final</p>
            <p><strong>Fecha fin:</strong> 16/8/2025</p>
          </div>

          <div className="right">
            <p><strong>Playera firmada:</strong> Sí</p>
            <p><strong>Contrincante:</strong> América</p>
            <p><strong>Temporada:</strong> 24/25</p>
            <p><strong>Posición:</strong> Delantero</p>
            <p><strong>Fecha inicio:</strong> 16/8/2025</p>
          </div>
        </div>

        <div className="confirmation-check">
          <input type="checkbox" id="accept" />
          <label htmlFor="accept">Confirmo que la información de la subasta es la correcta</label>
        </div>

        <button className="continue-btn" onClick={handleContinue}>
          Continuar
        </button>
      </div>
    </div>
  );
};

export default AuctionConfirmation;






// 📁 src/DashboardForm.jsx

import React, { useState } from 'react';
import './DashboardForm.css';
import AuctionConfirmation from './AuctionConfirmation';
import { jerseys } from './jerseys';

const DashboardForm = () => {
  const [formPlayer, setFormPlayer] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedJerseyId, setSelectedJerseyId] = useState(null);

  const handleConfirmAuction = () => {
    const jersey = jerseys.find(j =>
      j.player.toLowerCase() === formPlayer.trim().toLowerCase() &&
      j.number.toString() === formNumber.trim()
    );

    if (jersey) {
      console.log("🧠 Jersey encontrada:", jersey);
      setSelectedJerseyId(jersey.id);
      setShowConfirmation(true);
    } else {
      console.log("⚠️ No se encontró la jersey con esos datos.");
      alert("❌ No se encontró ninguna playera con ese nombre y número.");
    }
  };

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-title">DASHBOARD</h2>

      <div className="form-body">
        <input
          type="text"
          placeholder="Nombre del jugador"
          value={formPlayer}
          onChange={(e) => setFormPlayer(e.target.value)}
        />
        <input
          type="text"
          placeholder="Número de la playera"
          value={formNumber}
          onChange={(e) => setFormNumber(e.target.value)}
        />

        <button className="submit-btn" onClick={handleConfirmAuction}>
          Confirmar subasta
        </button>
      </div>

      {showConfirmation && (
        <AuctionConfirmation
          jerseyId={selectedJerseyId}
          onClose={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};

export default DashboardForm;



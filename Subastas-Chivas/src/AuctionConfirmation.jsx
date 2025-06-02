// 📁 src/AuctionConfirmation.jsx

import React from "react";
import "./AuctionConfirmation.css";
import { jerseys } from "./jerseys";

const AuctionConfirmation = ({ jerseyId, onClose }) => {
  const jersey = jerseys.find((j) => j.id === jerseyId);

  console.log("📦 Jersey ID recibido:", jerseyId);
  console.log("🧾 Jersey encontrada:", jersey);

  if (!jersey) return null;

  const formatDate = (date) => new Date(date).toLocaleDateString("es-MX");

  return (
    <div className="confirmation-overlay">
      <div className="confirmation-card">
        <button className="close-btn" onClick={onClose}>×</button>

        <h3 className="confirmation-title">CONFIRMACIÓN</h3>
        <p>Estás por comenzar una subasta para la playera</p>
        <h2 className="confirmation-player">#{jersey.number} {jersey.player}</h2>

        <p className="confirmation-subtitle">con las siguientes características:</p>

        <div className="confirmation-table">
          <div><strong>Playera usada:</strong><span>{jersey.used ? "Sí" : "No"}</span></div>
          <div><strong>Playera firmada:</strong><span>{jersey.signed ? "Sí" : "No"}</span></div>
          <div><strong>Monto inicial:</strong><span>${jersey.highest_bid} MXN</span></div>
          <div><strong>Contrincante:</strong><span>{jersey.match}</span></div>
          <div><strong>Fecha:</strong><span>{formatDate(jersey.starting_date)}</span></div>
          <div><strong>Temporada:</strong><span>{jersey.season}</span></div>
          <div><strong>Liga:</strong><span>{jersey.league}</span></div>
          <div><strong>Posición:</strong><span>{jersey.position}</span></div>
          <div><strong>Fase:</strong><span>{jersey.phase}</span></div>
          <div><strong>Fecha inicio:</strong><span>{formatDate(jersey.starting_date)}</span></div>
          <div><strong>Fecha fin:</strong><span>{formatDate(jersey.end_date)}</span></div>
        </div>

        <label className="confirmation-check">
          <input type="checkbox" />
          He leído y acepto la información anterior
        </label>

        <button className="confirm-btn" onClick={() => console.log("✅ Confirmar subasta")}>
          Continuar
        </button>
      </div>
    </div>
  );
};

export default AuctionConfirmation;





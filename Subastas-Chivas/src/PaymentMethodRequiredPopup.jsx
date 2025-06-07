import React from 'react';
import { useNavigate } from 'react-router-dom';
import './confirmation-popup.css'; // Reuse existing styles for consistency

export default function PaymentMethodRequiredPopup({ onCancel }) {
  const navigate = useNavigate();

  const handleAddCard = () => {
    // Navigate only when the user clicks the button
    navigate('/dashboardUsuario/ajustes');
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="popup-close" onClick={onCancel}>
          <span className="popup-close-x">×</span>
        </button>

        <p className="popup-title">No tienes una tarjeta registrada</p>
        <div className="popup-actions">
          <button className="popup-confirm" onClick={handleAddCard}>
            Añadir Tarjeta
          </button>
        </div>
      </div>
    </div>
  );
}
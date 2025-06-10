import React from 'react';
import { useNavigate } from 'react-router-dom';
import './confirmation-popup.css'; // Reuse existing styles for consistency

export default function LoginPromptPopup({ onCancel }) {
  const navigate = useNavigate();

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        {/* Close button */}
        <button className="popup-close" onClick={onCancel}>
          <p className="popup-close-x">✖</p>
        </button>
        <p className="popup-title">No has iniciado sesión</p>
        <div className="popup-actions">
          <button className="popup-confirm" onClick={() => navigate('/login')}>
            Iniciar Sesión
          </button>
          <button className="popup-confirm" onClick={() => navigate('/signup')}>
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
}
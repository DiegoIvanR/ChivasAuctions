import React from 'react';
import './confirmation-popup.css';

export default function ConfirmationPopup({ 
  bid, 
  jerseyName, 
  termsAccepted, 
  onCheckboxChange, 
  onConfirm, 
  onCancel,
  isProcessing = false 
}) {
  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="popup-close" onClick={onCancel}>
          <span className="popup-close-x">×</span>
        </button>
        <h3 className="popup-title">CONFIRMACIÓN</h3>
        <div className="popup-message">Estás por realizar una puja por la suma de</div>
        <div className="popup-title">${bid} USD
        </div>

        <div className='popup-message'>Para el jersey del jugador {jerseyName}</div>
        <hr className="popup-divider" />
        <div className="popup-message warning">
          <p>Al confirmar esta puja, aceptas que es legalmente vinculante. Si ganas la subasta, el pago de <strong>${bid} USD</strong> se procesará automáticamente usando tu método de pago registrado.</p>
        </div>
        <hr className="popup-divider" />
        <div className="popup-terms">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={onCheckboxChange}
              disabled={isProcessing}
              className='popup-checkbox'
            />
            Acepto que esta puja es vinculante y autorizo el cargo automático si gano la subasta
        </div>
        <hr className="popup-divider" />
        <div className="popup-actions">
          
          <button 
            onClick={onConfirm} 
            className="popup-confirm"
            disabled={!termsAccepted || isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'CONTINUAR'}
          </button>
        </div>

        {isProcessing && (
          <div className="popup-processing">
            <p>🔄 Creando intención de pago y procesando tu puja...</p>
          </div>
        )}
      </div>
    </div>
  );
}
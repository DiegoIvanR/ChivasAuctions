import React from 'react';
import './confirmation-popup.css';

export default function ConfirmationPopup({ 
  bid, 
  jerseyId, 
  termsAccepted, 
  onCheckboxChange, 
  onConfirm, 
  onCancel,
  isProcessing = false 
}) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>Confirmar Puja</h3>
        <div className="popup-bid-info">
          <p><strong>Monto de la puja:</strong> ${bid}</p>
          <p><strong>Jersey ID:</strong> {jerseyId}</p>
        </div>
        
        <div className="popup-warning">
          <p>⚠️ <strong>Puja Vinculante:</strong></p>
          <p>Al confirmar esta puja, aceptas que es legalmente vinculante. Si ganas la subasta, el pago de <strong>${bid}</strong> se procesará automáticamente usando tu método de pago registrado.</p>
        </div>

        <div className="popup-terms">
          <label>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={onCheckboxChange}
              disabled={isProcessing}
            />
            Acepto que esta puja es vinculante y autorizo el cargo automático si gano la subasta
          </label>
        </div>

        <div className="popup-buttons">
          <button 
            onClick={onCancel} 
            className="popup-cancel-btn"
            disabled={isProcessing}
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            className="popup-confirm-btn"
            disabled={!termsAccepted || isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'Confirmar Puja'}
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
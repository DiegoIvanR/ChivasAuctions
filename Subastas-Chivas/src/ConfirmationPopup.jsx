import React from 'react';

export default function ConfirmationPopup({
    bid,
    jerseyId,
    termsAccepted,
    onCheckboxChange,
    onConfirm,
    onCancel,
}) {
    return (
        <div className="popup-overlay">
            <div className="popup-container">
                <button className="popup-close" onClick={onCancel}>✖</button>
                <p className="popup-message">
                    ¿Confirmas tu puja de <strong>${bid}</strong> para el jersey con ID <strong>{jerseyId}</strong>?
                </p>
                <div className="popup-terms">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={termsAccepted}
                        onChange={onCheckboxChange}
                    />
                    <label htmlFor="terms">Acepto los términos y condiciones</label>
                </div>
                <div className="popup-actions">
                    <button
                        className="popup-confirm"
                        onClick={onConfirm}
                        disabled={!termsAccepted}
                    >
                        Continuar
                    </button>
                </div>
            </div>
        </div>
    );
}
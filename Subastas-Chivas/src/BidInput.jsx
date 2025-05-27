import React, { useState } from 'react';
import './confirmation-popup.css';
import ConfirmationPopup from './ConfirmationPopup';
import CancelTimer from './CancelTimer';

export default function BidInput({ jersey, onBidUpdate }) {
    const [bid, setBid] = useState(jersey.highest_bid + 100);
    const [warning, setWarning] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [previousBid, setPreviousBid] = useState(null);
    const [showCancelTimer, setShowCancelTimer] = useState(false);

    const handleBidChange = (e) => {
        setBid(Number(e.target.value));
        setWarning(''); // Clear warning when user changes input
    };

    const handleBidSubmit = () => {
        if (bid <= jersey.highest_bid) {
            setWarning('La puja debe ser mayor a la puja actual.');
            return;
        }
        setShowPopup(true); // Show the confirmation popup
    };

    const handleConfirm = () => {
        if (termsAccepted) {
            setPreviousBid(jersey.highest_bid); // Save the previous bid
            onBidUpdate(bid); // Update the bid in the parent component
            setShowPopup(false); // Close the popup
            setWarning('¡Puja exitosa!');
            setTermsAccepted(false); // Reset the checkbox
            setShowCancelTimer(true); // Show the cancel timer
        }
    };

    const handleCancel = () => {
        if (previousBid !== null) {
            onBidUpdate(previousBid); // Revert to the previous bid
            setPreviousBid(null); // Clear the previous bid
            setShowCancelTimer(false); // Hide the cancel timer
        }
    };

    const handleTimerEnd = () => {
        setShowCancelTimer(false); // Hide the cancel timer when it expires
    };

    const handleCheckboxChange = (e) => {
        setTermsAccepted(e.target.checked);
    };

    return (
        <div className="bid-input-container">
            <input
                type="number"
                value={bid}
                onChange={handleBidChange}
                className="bid-input"
                min={jersey.highest_bid + 1}
            />
            <button onClick={handleBidSubmit} className="bid-button">
                Puja
            </button>
            {warning && <p className="bid-warning">{warning}</p>}

            {showPopup && (
                <ConfirmationPopup
                    bid={bid}
                    jerseyId={jersey.id}
                    termsAccepted={termsAccepted}
                    onCheckboxChange={handleCheckboxChange}
                    onConfirm={handleConfirm}
                    onCancel={() => setShowPopup(false)}
                />
            )}

            {showCancelTimer && (
                <CancelTimer
                    previousBid={previousBid}
                    onCancel={handleCancel}
                    onTimerEnd={handleTimerEnd}
                />
            )}
        </div>
    );
}
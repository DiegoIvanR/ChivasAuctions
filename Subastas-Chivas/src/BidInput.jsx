import React, { useState } from 'react';
import './confirmation-popup.css';
import ConfirmationPopup from './ConfirmationPopup';
import LoginPromptPopup from './LoginPromptPopup'; // Import the new LoginPromptPopup component
import { useSelector } from 'react-redux';
import { supabase } from './supabaseClient'; // Import the Supabase client
import './bidInput.css'; // Import the CSS for styling

export default function BidInput({ jersey, onBidUpdate }) {
  const [bid, setBid] = useState(jersey.starting_bid + 100); // Use `starting_bid` from the updated `jersey` object
  const [warning, setWarning] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleBidChange = (e) => {
    setBid(Number(e.target.value));
    setWarning(''); // Clear warning when user changes input
  };

  const handleBidSubmit = () => {
    if (bid <= jersey.starting_bid) { // Compare against `starting_bid`
      setWarning('La puja debe ser mayor a la puja actual.');
      return;
    }
    setShowPopup(true); // Show the popup
  };

  const handleConfirm = async () => {
    if (termsAccepted) {
      try {
        const { data, error } = await supabase
          .from('bids')
          .insert([
            {
              bid_id: crypto.randomUUID(), // Generate a unique bid ID
              auction_id: jersey.auction_id, // Use the auction ID from the jersey object
              bidder_id: user.id, // Use the logged-in user's ID
              amount: bid, // Insert the bid amount
              created_at: new Date().toISOString(), // Add the current timestamp
            },
          ]);

        if (error) {
          console.error('Error inserting bid:', error.message);
          setWarning('Error al realizar la puja. Inténtalo de nuevo.');
          return;
        }

        console.log('Bid inserted successfully:', data);
        onBidUpdate(bid); // Update the bid in the parent component
        setWarning('¡Puja exitosa!');
        setTermsAccepted(false); // Reset the checkbox
        setShowPopup(false); // Close the popup
        window.alert('¡Puja exitosa!'); // Show success alert
      } catch (err) {
        console.error('Unexpected error inserting bid:', err);
        setWarning('Error al realizar la puja. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="bid-input-container">
      <input
        type="number"
        value={bid}
        onChange={handleBidChange}
        className="bid-input"
        min={jersey.starting_bid + 1} // Ensure the minimum bid is greater than `starting_bid`
      />
      <button onClick={handleBidSubmit} className="bid-button">
        Puja
      </button>
      {warning && <p className="bid-warning">{warning}</p>}

      {/* Popup for logged-in users */}
      {showPopup && user && (
        <ConfirmationPopup
          bid={bid}
          jerseyId={jersey.jersey_id}
          termsAccepted={termsAccepted}
          onCheckboxChange={(e) => setTermsAccepted(e.target.checked)}
          onConfirm={handleConfirm}
          onCancel={() => setShowPopup(false)}
        />
      )}

      {/* Popup for logged-out users */}
      {showPopup && !user && (
        <LoginPromptPopup onCancel={() => setShowPopup(false)} />
      )}
    </div>
  );
}
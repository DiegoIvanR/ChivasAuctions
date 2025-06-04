import React, { useState, useEffect } from 'react';
import './confirmation-popup.css';
import ConfirmationPopup from './ConfirmationPopup';
import LoginPromptPopup from './LoginPromptPopup';
import { useSelector } from 'react-redux';
import { supabase } from './supabaseClient';
import './bidInput.css';
import PaymentMethodRequiredPopup from './PaymentMethodRequiredPopup';

export default function BidInput({ jersey, onBidUpdate }) {
  const [bid, setBid] = useState(jersey.starting_bid + 100);
  const [warning, setWarning] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [isProcessingBid, setIsProcessingBid] = useState(false);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if the user has a payment method when the component mounts
    const checkPaymentMethod = async () => {
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('default_payment_method_id')
          .eq('id', user.id)
          .single();

        if (!error && profile?.default_payment_method_id) {
          setHasPaymentMethod(true);
        } else {
          setHasPaymentMethod(false);
        }
      }
    };

    checkPaymentMethod();
  }, [user]);

  const handleBidChange = (e) => {
    setBid(Number(e.target.value));
    setWarning(''); // Clear warning when user changes input
  };

  const handleBidSubmit = () => {
    if (bid <= jersey.starting_bid) {
      setWarning('La puja debe ser mayor a la puja actual.');
      return;
    }
    setShowPopup(true); // Show the popup
  };

  const createPaymentIntent = async (bidAmount, auctionId) => {
    try {
      // Get current session token
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.session?.access_token) {
        throw new Error('No se pudo autenticar. Por favor, inicia sesión nuevamente.');
      }

      // Call the edge function to create payment intent
      const response = await fetch(
        "https://tlhejbmdwowbhcyviydm.functions.supabase.co/createPaymentIntent", // Update this URL to your actual edge function URL
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            amount: bidAmount,
            auction_id: auctionId
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error("Edge function error:", data);
        throw new Error(data.error || "Error al crear la intención de pago");
      }

      return data.payment_intent_id;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  };

  const handleConfirm = async () => {
    if (!termsAccepted) {
      setWarning('Debes aceptar los términos y condiciones para continuar.');
      return;
    }

    setIsProcessingBid(true);
    setWarning('');

    try {
      // Step 1: Create payment intent
      console.log('Creating payment intent for bid:', bid);
      const paymentIntentId = await createPaymentIntent(bid, jersey.auction_id);
      console.log('Payment intent created:', paymentIntentId);

      // Step 2: Insert bid with payment_intent_id
      const { data, error } = await supabase
        .from('bids')
        .insert([
          {
            bid_id: crypto.randomUUID(),
            auction_id: jersey.auction_id,
            bidder_id: user.id,
            amount: bid,
            payment_intent_id: paymentIntentId, // Store the payment intent ID
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.error('Error inserting bid:', error.message);
        setWarning('Error al realizar la puja. Inténtalo de nuevo.');
        setIsProcessingBid(false);
        return;
      }

      console.log('Bid inserted successfully:', data);
      onBidUpdate(bid); // Update the bid in the parent component
      setWarning('¡Puja exitosa! El pago se procesará al finalizar la subasta.');
      setTermsAccepted(false); // Reset the checkbox
      setShowPopup(false); // Close the popup
      window.alert('¡Puja exitosa! El pago se procesará automáticamente si ganas la subasta.');
      
    } catch (err) {
      console.error('Error processing bid:', err);
      setWarning(err.message || 'Error al realizar la puja. Inténtalo de nuevo.');
    } finally {
      setIsProcessingBid(false);
    }
  };

  return (
    <div className="bid-input-container">
      <input
        type="number"
        value={bid}
        onChange={handleBidChange}
        className="bid-input"
        min={jersey.starting_bid + 1}
        disabled={isProcessingBid}
      />
      <button 
        onClick={handleBidSubmit} 
        className="bid-button"
        disabled={isProcessingBid}
      >
        {isProcessingBid ? 'PROCESANDO...' : 'PUJA'}
      </button>
      {warning && <p className="bid-warning">{warning}</p>}

      {/* Popup for logged-in users with payment method */}
      {showPopup && user && hasPaymentMethod && (
        <ConfirmationPopup
          bid={bid}
          jerseyId={jersey.jersey_id}
          termsAccepted={termsAccepted}
          onCheckboxChange={(e) => setTermsAccepted(e.target.checked)}
          onConfirm={handleConfirm}
          onCancel={() => setShowPopup(false)}
          isProcessing={isProcessingBid}
        />
      )}

      {/* Popup for logged-out users */}
      {showPopup && !user && (
        <LoginPromptPopup onCancel={() => setShowPopup(false)} />
      )}

      {/* Popup for users without payment method */}
      {showPopup && !hasPaymentMethod && user && (
        <PaymentMethodRequiredPopup onCancel={() => setShowPopup(false)} />
      )}
    </div>
  );
}
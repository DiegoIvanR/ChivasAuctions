import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "./add-card-form.css";

export default function AddCardForm({ onPaymentMethodSaved }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMsg, setErrorMsg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const processingRef = useRef(false); // Prevent double submissions

  // Check if user already has a payment method on component mount
  useEffect(() => {
    checkExistingPaymentMethod();
  }, []);

  const checkExistingPaymentMethod = async () => {
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.user) return;
      
      setCurrentUser(user.user);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("default_payment_method_id")
        .eq("id", user.user.id)
        .single();

      if (!profileError && profile?.default_payment_method_id) {
        setHasPaymentMethod(true);
        setSuccessMsg("Ya tienes un método de pago configurado");
      }
    } catch (error) {
      console.error("Error checking payment method:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submissions
    if (processingRef.current) {
      return;
    }
    
    setErrorMsg(null);
    setSuccessMsg(null);
  
    if (!stripe || !elements) {
      return setErrorMsg("Stripe no está listo");
    }
  
    processingRef.current = true;
    setIsProcessing(true);

    try {
      // Get current session token
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.session?.access_token) {
        setErrorMsg("No se pudo autenticar. Por favor, inicia sesión nuevamente.");
        processingRef.current = false;
        setIsProcessing(false);
        return;
      }

      // Fetch client_secret from Edge Function
      const response = await fetch(
        "https://tlhejbmdwowbhcyviydm.functions.supabase.co/createOrUpdateStripeCustomer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error("Edge function error:", data);
        setErrorMsg(data.error || "Error al configurar el método de pago");
        processingRef.current = false;
        setIsProcessing(false);
        return;
      }
    
      const { client_secret, customer_id } = data;
      if (!client_secret) {
        setErrorMsg("No se pudo obtener el client_secret del SetupIntent");
        processingRef.current = false;
        setIsProcessing(false);
        return;
      }

      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setErrorMsg("No se encontró el elemento de tarjeta");
        processingRef.current = false;
        setIsProcessing(false);
        return;
      }
    
      // Confirm SetupIntent with Stripe
      const confirmResult = await stripe.confirmCardSetup(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: currentUser?.user_metadata?.full_name || currentUser?.email,
            email: currentUser?.email,
          },
        },
      });
    
      if (confirmResult.error) {
        console.error("Error confirmando SetupIntent:", confirmResult.error);
        setErrorMsg(confirmResult.error.message);
        processingRef.current = false;
        setIsProcessing(false);
        return;
      }
    
      // Get the payment method ID from the successful setup
      const paymentMethodId = confirmResult.setupIntent.payment_method;
      if (!paymentMethodId) {
        setErrorMsg("No se pudo obtener el método de pago");
        processingRef.current = false;
        setIsProcessing(false);
        return;
      }
    
      // Save the payment method ID to the user's profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          default_payment_method_id: paymentMethodId,
        })
        .eq("id", currentUser.id);
    
      if (updateError) {
        console.error("Error guardando payment_method_id:", updateError);
        setErrorMsg("No se pudo guardar el método de pago en el perfil");
        processingRef.current = false;
        setIsProcessing(false);
        return;
      }
    
      // SUCCESS! 
      setSuccessMsg("🎉 Método de pago configurado correctamente. Ya puedes participar en subastas vinculantes.");
      
      // Notify parent component if callback provided
      if (onPaymentMethodSaved) {
        onPaymentMethodSaved({
          paymentMethodId,
          customerId: customer_id
        });
      }

      // Update state after a brief delay to ensure all operations complete
      setTimeout(() => {
        setHasPaymentMethod(true);
        processingRef.current = false;
        setIsProcessing(false);
      }, 500);

    } catch (error) {
      console.error("Unexpected error:", error);
      setErrorMsg("Error inesperado. Por favor, intenta nuevamente.");
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  const handleChangePaymentMethod = () => {
    setHasPaymentMethod(false);
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  if (hasPaymentMethod) {
    return (
      <div className="stripe-add" style={{ maxWidth: 500, margin: "0 auto" }}>
        <div style={{ 
          padding: 20, 
          backgroundColor: "#f0f8f0", 
          border: "1px solid #4caf50", 
          borderRadius: 8,
          textAlign: "center"
        }}>
          <h3 style={{ color: "#2e7d32", margin: "0 0 10px 0" }}>
            ✅ Método de Pago Configurado
          </h3>
          <p style={{ color: "#2e7d32", margin: 0 }}>
            Tu tarjeta está lista para participar en subastas vinculantes
          </p>
          <button
            onClick={handleChangePaymentMethod}
            style={{
              marginTop: 15,
              padding: "8px 16px",
              backgroundColor: "transparent",
              color: "#2e7d32",
              border: "1px solid #2e7d32",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Cambiar Método de Pago
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stripe-add" style={{ maxWidth: 500, margin: "0 auto" }}>
      <div style={{ 
        padding: 20, 
        backgroundColor: "#fff3cd", 
        border: "1px solid #ffc107", 
        borderRadius: 8,
        marginBottom: 20
      }}>
        <h3 style={{ color: "#856404", margin: "0 0 10px 0" }}>
          ⚖️ Subastas Vinculantes
        </h3>
        <p style={{ color: "#856404", margin: 0, fontSize: "14px" }}>
          Al configurar tu método de pago, aceptas que todas tus pujas serán 
          <strong> legalmente vinculantes</strong>. Si ganas una subasta, 
          el pago se procesará automáticamente.
        </p>
      </div>

      <h2 className="stripe-text">Configurar Método de Pago</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ 
          border: "1px solid #ccc", 
          padding: 15, 
          borderRadius: 8,
          backgroundColor: "#fafafa"
        }}>
          <CardElement 
            options={{ 
              hidePostalCode: false,
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }} 
          />
        </div>
        
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          style={{
            marginTop: 20,
            width: "100%",
            padding: "12px 20px",
            backgroundColor: isProcessing ? "#ccc" : "#6772e5",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: isProcessing ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          {isProcessing ? "Procesando..." : "💳 Configurar Método de Pago"}
        </button>
      </form>

      {errorMsg && (
        <div style={{ 
          color: "#d32f2f", 
          marginTop: 20, 
          padding: 15,
          backgroundColor: "#ffebee",
          border: "1px solid #f8bbd9",
          borderRadius: 8
        }}>
          ❌ {errorMsg}
        </div>
      )}
      
      {successMsg && (
        <div style={{ 
          color: "#2e7d32", 
          marginTop: 20,
          padding: 15,
          backgroundColor: "#f0f8f0",
          border: "1px solid #4caf50",
          borderRadius: 8
        }}>
          {successMsg}
        </div>
      )}
    </div>
  );
}
// filepath: [AddCardForm.jsx](http://_vscodecontentref_/2)
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "./add-card-form.css";

export default function AddCardForm({ onPaymentMethodSaved, bidBanner }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMsg, setErrorMsg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const processingRef = useRef(false); // Prevent double submissions

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
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.session?.access_token) {
        setErrorMsg("No se pudo autenticar. Por favor, inicia sesión nuevamente.");
        processingRef.current = false;
        setIsProcessing(false);
        return;
      }

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

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setErrorMsg("No se encontró el elemento de tarjeta");
        processingRef.current = false;
        setIsProcessing(false);
        return;
      }

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

      const paymentMethodId = confirmResult.setupIntent.payment_method;
      if (!paymentMethodId) {
        setErrorMsg("No se pudo obtener el método de pago");
        processingRef.current = false;
        setIsProcessing(false);
        return;
      }

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

      setSuccessMsg("Método de pago configurado correctamente. Ya puedes participar en subastas vinculantes.");

      if (onPaymentMethodSaved) {
        onPaymentMethodSaved({
          paymentMethodId,
          customerId: customer_id,
        });
      }

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
      <div className="stripe-add">
        <div className="payment-method-configured">
          <h3 className="binding-auctions-warning-title">Método de Pago Configurado</h3>
          {bidBanner && <p className="binding-auctions-warning-text success">Tu tarjeta está lista para participar en subastas vinculantes</p>}
          <button onClick={handleChangePaymentMethod} className="change-button">
            Cambiar Método de Pago
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stripe-add">
      {bidBanner && <div className="binding-auctions-warning">
        <h3 className="binding-auctions-warning-title">Subastas Vinculantes</h3>
        <p className="binding-auctions-warning-text">
          Al configurar tu método de pago, aceptas que todas tus pujas serán <strong>legalmente vinculantes</strong>. Si ganas una subasta, el pago se procesará automáticamente.
        </p>
      </div>}

      <h2 className="stripe-text">Configurar Método de Pago</h2>
      <form onSubmit={handleSubmit}>
        <div className="card-element-container">
          <CardElement
            options={{
              hidePostalCode: false,
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
              },
            }}
          />
        </div>

        <button type="submit" disabled={!stripe || isProcessing} className="submit-button">
          {isProcessing ? "Procesando..." : "Configurar Método de Pago"}
        </button>
      </form>

      {errorMsg && <div className="error-message">{errorMsg}</div>}
      {successMsg && <div className="success-message">{successMsg}</div>}
    </div>
  );
}
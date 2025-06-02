import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import AddCardForm from "./AddCardForm";

export default function PaymentMethodGuard({ 
  children, 
  requirePaymentMethod = true,
  loadingComponent = null,
  fallbackComponent = null 
}) {
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    checkPaymentMethodStatus();
  }, []);

  const checkPaymentMethodStatus = async () => {
    try {
      setIsLoading(true);
      
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.user) {
        setIsLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("default_payment_method_id, stripe_customer_id")
        .eq("id", user.user.id)
        .single();

      if (!profileError && profile) {
        setUserProfile(profile);
        setHasPaymentMethod(!!profile.default_payment_method_id);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking payment method:", error);
      setIsLoading(false);
    }
  };

  const handlePaymentMethodSaved = (paymentData) => {
    setHasPaymentMethod(true);
    setUserProfile(prev => ({
      ...prev,
      default_payment_method_id: paymentData.paymentMethodId
    }));
  };

  if (isLoading) {
    return loadingComponent || (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "200px" 
      }}>
        <div>Verificando método de pago...</div>
      </div>
    );
  }

  // If payment method is required but user doesn't have one
  if (requirePaymentMethod && !hasPaymentMethod) {
    return fallbackComponent || (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
        <div style={{
          backgroundColor: "#ffebee",
          border: "1px solid #f8bbd9",
          borderRadius: 8,
          padding: 20,
          marginBottom: 30,
          textAlign: "center"
        }}>
          <h2 style={{ color: "#d32f2f", margin: "0 0 15px 0" }}>
            🔒 Método de Pago Requerido
          </h2>
          <p style={{ color: "#d32f2f", margin: 0 }}>
            Para participar en subastas vinculantes, necesitas configurar 
            un método de pago válido.
          </p>
        </div>
        
        <AddCardForm onPaymentMethodSaved={handlePaymentMethodSaved} />
      </div>
    );
  }

  // User has payment method or it's not required, render children
  return React.cloneElement(children, { 
    userPaymentProfile: userProfile,
    hasPaymentMethod 
  });
}

// Usage examples:
// <PaymentMethodGuard requirePaymentMethod={true}>
//   <AuctionPage />
// </PaymentMethodGuard>
//
// <PaymentMethodGuard requirePaymentMethod={false}>
//   <BrowseAuctions />
// </PaymentMethodGuard>
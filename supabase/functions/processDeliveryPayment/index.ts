// processDeliveryPayment
import { serve } from "https://deno.land/std@0.166.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.15.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Helper function to extract charge ID from PaymentIntent
function extractChargeId(paymentIntent: any): string | null {
  // First check for latest_charge (most reliable)
  if (paymentIntent.latest_charge) {
    return paymentIntent.latest_charge;
  }
  
  // Fallback to charges collection
  if (paymentIntent.charges && paymentIntent.charges.data && paymentIntent.charges.data.length > 0) {
    return paymentIntent.charges.data[0].id;
  }
  
  return null;
}

serve(async (req) => {
  try {
    // Handle preflight OPTIONS request for CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    // Verify that the request is POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Método no permitido" }), {
        status: 405,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    // Read JWT from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "No autorizado - falta token" }), {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    const token = authHeader.split(" ")[1];
    
    // Get user from JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Error obteniendo usuario:", userError);
      return new Response(JSON.stringify({ 
        error: "Token inválido", 
        details: userError?.message 
      }), {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    // Parse request body
    const { payment_id, delivery_address } = await req.json();
    
    if (!payment_id || !delivery_address) {
      return new Response(JSON.stringify({ 
        error: "Faltan parámetros requeridos: payment_id y delivery_address" 
      }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    const userId = user.id;
    const userEmail = user.email!;

    console.log(`Processing delivery payment for user: ${userId} (${userEmail}), payment_id: ${payment_id}`);

    // Get user's Stripe customer ID and payment method
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id, default_payment_method_id")
      .eq("id", userId)
      .single();
    
    if (profileError) {
      console.error("Error al leer perfil:", profileError);
      return new Response(JSON.stringify({ 
        error: "Error al leer perfil del usuario",
        details: profileError.message 
      }), {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    if (!profile?.stripe_customer_id) {
      return new Response(JSON.stringify({ 
        error: "Usuario no tiene un customer ID de Stripe configurado" 
      }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    if (!profile?.default_payment_method_id) {
      return new Response(JSON.stringify({ 
        error: "Usuario no tiene un método de pago configurado" 
      }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    // Create PaymentIntent for delivery charge - $20 USD
    const amountInCents = 2000; // $20.00 USD
    
    console.log("Creating delivery PaymentIntent with Stripe:", {
      amount: amountInCents,
      customer: profile.stripe_customer_id,
      payment_method: profile.default_payment_method_id
    });
    
    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      customer: profile.stripe_customer_id,
      payment_method: profile.default_payment_method_id,
      confirmation_method: "manual",
      confirm: true, // Immediately confirm the payment
      return_url: "https://www.google.com", // Required for redirect-based payment methods
      metadata: {
        supabase_user_id: userId,
        payment_id: payment_id,
        delivery_amount: "20.00",
        type: "delivery_payment"
      },
    });

    console.log("PaymentIntent created with status:", paymentIntent.status);

    let chargeId: string | null = null;

    // Handle different PaymentIntent statuses
    if (paymentIntent.status === "requires_capture") {
      console.log(`Capturing delivery PaymentIntent ${paymentIntent.id}`);
      
      const captured = await stripe.paymentIntents.capture(paymentIntent.id);
      console.log(`Delivery PaymentIntent captured, status: ${captured.status}`);
      
      chargeId = extractChargeId(captured);
    } else if (paymentIntent.status === "succeeded") {
      console.log(`Delivery PaymentIntent ${paymentIntent.id} already succeeded`);
      
      chargeId = extractChargeId(paymentIntent);
    } else {
      console.error(`Unexpected PaymentIntent status: ${paymentIntent.status}`);
      return new Response(JSON.stringify({ 
        error: "Error al procesar el pago de envío",
        details: `Payment status: ${paymentIntent.status}`
      }), {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    if (!chargeId) {
      console.error("No charge ID could be extracted from PaymentIntent");
      return new Response(JSON.stringify({ 
        error: "Error al procesar el pago de envío",
        details: "No se pudo obtener el ID del cargo"
      }), {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    console.log("Charge created successfully:", chargeId);

    // Update the payment record in Supabase
    const { data: updatedPayment, error: updateError } = await supabase
      .from("payments")
      .update({
        stripe_delivery_payment_id: chargeId,
        delivery_address: delivery_address
      })
      .eq("payment_id", payment_id)
      .select();

    if (updateError) {
      console.error("Error al actualizar payment:", updateError);
      return new Response(JSON.stringify({ 
        error: "Error al actualizar el registro de pago",
        details: updateError.message 
      }), {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    console.log("Payment updated successfully:", updatedPayment);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        charge_id: chargeId,
        payment_intent_id: paymentIntent.id,
        amount_charged: 20.00,
        payment_updated: true
      }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
    
  } catch (err) {
    console.error("Error en processDeliveryPayment:", err);
    return new Response(JSON.stringify({ 
      error: "Error interno del servidor",
      details: err.message 
    }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  }
});
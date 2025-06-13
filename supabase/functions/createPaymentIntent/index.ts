// createPaymentIntent
import { serve } from "https://deno.land/std@0.166.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;

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
    const { amount, auction_id } = await req.json();
    
    if (!amount || !auction_id) {
      return new Response(JSON.stringify({ 
        error: "Faltan parámetros requeridos: amount y auction_id" 
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

    console.log(`Creating payment intent for user: ${userId} (${userEmail}), amount: ${amount}, auction: ${auction_id}`);

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

    // Create PaymentIntent with Stripe - amount in cents
    const amountInCents = Math.round(amount * 100);
    
    console.log("Creating PaymentIntent with Stripe:", {
      amount: amountInCents,
      customer: profile.stripe_customer_id,
      payment_method: profile.default_payment_method_id
    });
    
    const paymentIntentResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: amountInCents.toString(),
        currency: "usd",
        customer: profile.stripe_customer_id,
        payment_method: profile.default_payment_method_id,
        confirmation_method: "manual",
        capture_method: "manual", // This allows us to capture the payment later
        "metadata[supabase_user_id]": userId,
        "metadata[auction_id]": auction_id,
        "metadata[bid_amount]": amount.toString()
      }),
    });

    const paymentIntent = await paymentIntentResponse.json();
    
    if (!paymentIntent.id) {
      console.error("Error al crear PaymentIntent en Stripe:", paymentIntent);
      return new Response(JSON.stringify({ 
        error: "Error al crear el PaymentIntent en Stripe",
        details: paymentIntent.error?.message || "Unknown PaymentIntent error"
      }), {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    console.log("PaymentIntent created successfully:", paymentIntent.id);

    // Return the payment intent ID
    return new Response(
      JSON.stringify({
        payment_intent_id: paymentIntent.id,
        amount: amount,
        status: paymentIntent.status
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
    console.error("Error en createPaymentIntent:", err);
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
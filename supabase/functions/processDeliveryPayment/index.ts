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

    // Create charge directly with Stripe - $20 USD in cents
    const amountInCents = 2000; // $20.00 USD
    
    console.log("Creating charge with Stripe:", {
      amount: amountInCents,
      customer: profile.stripe_customer_id,
      payment_method: profile.default_payment_method_id
    });
    
    const chargeResponse = await fetch("https://api.stripe.com/v1/charges", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: amountInCents.toString(),
        currency: "usd",
        customer: profile.stripe_customer_id,
        source: profile.default_payment_method_id,
        description: `Delivery payment for payment ID: ${payment_id}`,
        "metadata[supabase_user_id]": userId,
        "metadata[payment_id]": payment_id,
        "metadata[delivery_amount]": "20.00"
      }),
    });

    const charge = await chargeResponse.json();
    
    if (!charge.id) {
      console.error("Error al crear charge en Stripe:", charge);
      return new Response(JSON.stringify({ 
        error: "Error al procesar el pago de envío",
        details: charge.error?.message || "Unknown charge error"
      }), {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    console.log("Charge created successfully:", charge.id);

    // Update the payment record in Supabase
    const { data: updatedPayment, error: updateError } = await supabase
      .from("payments")
      .update({
        stripe_charge_id: charge.id,
        stripe_delivery_payment_id: charge.id,
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
        charge_id: charge.id,
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
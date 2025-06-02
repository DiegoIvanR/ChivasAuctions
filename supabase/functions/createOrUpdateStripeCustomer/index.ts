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
    
    // FIXED: Use the correct method to get user from JWT
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

    const userId = user.id;
    const userEmail = user.email!;

    console.log(`Processing request for user: ${userId} (${userEmail})`);

    // Check if the user already has a Stripe customer ID in the profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error al leer perfil:", profileError);
      return new Response(JSON.stringify({ 
        error: "Error al leer perfil",
        details: profileError.message 
      }), {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    let stripeCustomerId = profile?.stripe_customer_id;
    
    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      console.log("Creating new Stripe customer for user:", userId);
      
      // Replace the customer creation code block with:
      const customerResponse = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: userEmail,
          "metadata[supabase_user_id]": userId
        }),
      });

      const customer = await customerResponse.json();
      
      if (!customer.id) {
        console.error("Error al crear cliente en Stripe:", customer);
        return new Response(JSON.stringify({ 
          error: "Error al crear el cliente en Stripe",
          details: customer.error?.message || "Unknown Stripe error"
        }), {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        });
      }
      
      stripeCustomerId = customer.id;
      console.log("Created Stripe customer:", stripeCustomerId);

      // Save the Stripe customer ID in the profiles table
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ 
          id: userId,
          stripe_customer_id: stripeCustomerId 
        }, {
          onConflict: 'id'
        });
        
      if (updateError) {
        console.error("Error al guardar stripe_customer_id en profiles:", updateError);
        // Don't fail the request, just log the error
        // The customer was created in Stripe successfully
      } else {
        console.log("Saved customer ID to profile:", stripeCustomerId);
      }
    } else {
      console.log("Using existing Stripe customer:", stripeCustomerId);
    }

    // Create a SetupIntent for the customer
    console.log("Creating SetupIntent for customer:", stripeCustomerId);
    
    const setupIntentResponse = await fetch("https://api.stripe.com/v1/setup_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        customer: stripeCustomerId,
        usage: "off_session",
        "metadata[supabase_user_id]": userId,
        "metadata[purpose]": "binding_auction_setup"
      }),
    });

    const setupIntent = await setupIntentResponse.json();
    
    if (!setupIntent.client_secret) {
      console.error("Error al crear SetupIntent en Stripe:", setupIntent);
      return new Response(JSON.stringify({ 
        error: "Error al crear el SetupIntent en Stripe",
        details: setupIntent.error?.message || "Unknown SetupIntent error"
      }), {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    console.log("SetupIntent created successfully:", setupIntent.id);

    // Return the client_secret to the frontend
    return new Response(
      JSON.stringify({
        client_secret: setupIntent.client_secret,
        customer_id: stripeCustomerId,
        setup_intent_id: setupIntent.id
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
    console.error("Error en createOrUpdateStripeCustomer:", err);
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
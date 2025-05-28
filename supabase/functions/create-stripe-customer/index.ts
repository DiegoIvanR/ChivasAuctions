import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import Stripe from "npm:stripe";
import { createClient } from "npm:@supabase/supabase-js";

// Read environment variables
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE")!;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // Parse the JSON body
  const { user_id, email, full_name } = await req.json();
  // 1. Fetch existing profile to check if stripe_customer_id exists
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user_id)
    .single();

  if (profileError) {
    return new Response(
      JSON.stringify({ error: "Profile not found." }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  let customerId = profile.stripe_customer_id;
  if (!customerId) {
    // 2. Create new Stripe Customer
    const customer = await stripe.customers.create({
      email,
      name: full_name,
      metadata: { supabase_user_id: user_id },
    });
    customerId = customer.id;
    // 3. Update supabase profiles.stripe_customer_id
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user_id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update profile with Stripe ID." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 4. Create a SetupIntent so the frontend can attach a card
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
  });

  return new Response(
    JSON.stringify({ client_secret: setupIntent.client_secret }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});

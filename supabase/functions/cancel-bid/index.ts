import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import Stripe from "npm:stripe";
import { createClient } from "npm:@supabase/supabase-js";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE")!;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    // 1. Authenticate from JWT
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const jwt = authHeader.replace("Bearer ", "");
    supabase.auth.setAuth(jwt);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not authenticated." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const userId = user.id;

    // 2. Parse JSON body
    const { bid_id } = await req.json();
    if (!bid_id) {
      return new Response(
        JSON.stringify({ error: "Missing bid_id." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Fetch the bid row
    const { data: bid, error: bidError } = await supabase
      .from("bids")
      .select("bid_id, bidder_id, payment_intent_id, created_at")
      .eq("bid_id", bid_id)
      .single();

    if (bidError || !bid) {
      return new Response(
        JSON.stringify({ error: "Bid not found." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Check if user is allowed to delete: either admin or own bid within 30 seconds
    const isAdminResp = await supabase
      .rpc("is_admin"); // returns boolean
    const isAdmin = isAdminResp.data === true;

    const now = new Date();
    const createdAt = new Date(bid.created_at);
    const secondsSince = (now.getTime() - createdAt.getTime()) / 1000;

    if (!( isAdmin || (bid.bidder_id === userId && secondsSince <= 30) )) {
      return new Response(
        JSON.stringify({ error: "Not allowed to delete this bid." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Refund the PaymentIntent
    try {
      await stripe.refunds.create({ payment_intent: bid.payment_intent_id });
    } catch (refundError) {
      console.error("Refund error:", refundError);
      // Continue to delete bid row anyway
    }

    // 6. Delete the bid row using service_role
    const { error: deleteError } = await supabase
      .from("bids")
      .delete()
      .eq("bid_id", bid_id);

    if (deleteError) {
      return new Response(
        JSON.stringify({ error: "Failed to delete bid." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Cancel-bid Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error canceling bid." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import Stripe from "npm:stripe";
import { createClient } from "npm:@supabase/supabase-js";

// Environment variables
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE")!;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });
// Use service_role key to bypass RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    // 1. Authenticate: extract user_id from Supabase JWT
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const jwt = authHeader.replace("Bearer ", "");
    // Supabase client will auto-attach the JWT for auth.uid()
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
    const { auction_id, bid_amount } = await req.json();

    // 3. Fetch user profile to get stripe_customer_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: "You must add a payment method first." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const customerId = profile.stripe_customer_id;

    // 4. Verify auction is live
    const { data: auction, error: auctionError } = await supabase
      .from("auctions")
      .select("auction_status, start_time, end_time")
      .eq("auction_id", auction_id)
      .single();

    if (auctionError || !auction) {
      return new Response(
        JSON.stringify({ error: "Auction not found." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    if (
      auction.auction_status !== "live" ||
      new Date() < new Date(auction.start_time) ||
      new Date() > new Date(auction.end_time)
    ) {
      return new Response(
        JSON.stringify({ error: "Auction is not currently live." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Fetch current highest bid (if any)
    const { data: highestBidRows } = await supabase
      .from("bids")
      .select("bid_id, amount, payment_intent_id")
      .eq("auction_id", auction_id)
      .order("amount", { ascending: false })
      .limit(1);

    let previousBid = highestBidRows && highestBidRows[0];

    // 6. If there is a previous highest bid, refund it
    if (previousBid && previousBid.payment_intent_id) {
      try {
        await stripe.refunds.create({
          payment_intent: previousBid.payment_intent_id,
        });
      } catch (refundError) {
        console.error("Refund error:", refundError);
        // We can continue even if refund fails—just log
      }
    }

    // 7. Create a new PaymentIntent for the new bid
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(bid_amount * 100), // in cents
      currency: "mxn",                      // Mexican pesos
      customer: customerId,
      payment_method_types: ["card"],
      confirm: true,  // attempt to charge immediately
      metadata: {
        supabase_user_id: userId,
        auction_id: auction_id,
      },
    });

    // 8. Insert new bid row using service_role key
    const { error: insertError } = await supabase
      .from("bids")
      .insert([
        {
          auction_id: auction_id,
          bidder_id: userId,
          amount: bid_amount,
          payment_intent_id: paymentIntent.id,
        },
      ]);

    if (insertError) {
      // If DB insert fails, refund the charge
      await stripe.refunds.create({ payment_intent: paymentIntent.id });
      return new Response(
        JSON.stringify({ error: "Failed to record bid." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 9. Return success
    return new Response(
      JSON.stringify({
        success: true,
        bid_amount,
        payment_intent_id: paymentIntent.id,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Process-bid Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error processing bid." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

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
    // 1. Authenticate with service_role key (no need to parse JWT; only admin calls this)
    // So we skip user auth. Just parse body:
    const { auction_id } = await req.json();
    if (!auction_id) {
      return new Response(
        JSON.stringify({ error: "Missing auction_id." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch auction
    const { data: auction, error: auctionError } = await supabase
      .from("auctions")
      .select("auction_status, end_time")
      .eq("auction_id", auction_id)
      .single();
    if (auctionError || !auction) {
      return new Response(
        JSON.stringify({ error: "Auction not found." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    // 3. Ensure end_time has passed
    if (new Date() < new Date(auction.end_time)) {
      return new Response(
        JSON.stringify({ error: "Auction has not ended yet." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Update auction_status to 'closed'
    const { error: updateError } = await supabase
      .from("auctions")
      .update({ auction_status: "closed" })
      .eq("auction_id", auction_id);
    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to close auction." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Find highest bid (if any)
    const { data: highestBidRows } = await supabase
      .from("bids")
      .select("bid_id, bidder_id, amount, payment_intent_id")
      .eq("auction_id", auction_id)
      .order("amount", { ascending: false })
      .limit(1);

    if (highestBidRows && highestBidRows.length > 0) {
      const winningBid = highestBidRows[0];
      // The PaymentIntent was already charged at bid time.
      // Optionally record in `payments` table:
      const { error: paymentError } = await supabase
        .from("payments")
        .insert([
          {
            auction_id: auction_id,
            bidder_id: winningBid.bidder_id,
            amount_charged: winningBid.amount,
            stripe_charge_id: winningBid.payment_intent_id,
          },
        ]);
      if (paymentError) {
        console.error("Failed to insert payment record:", paymentError);
      }
      // You could also send an email to winningBid.bidder_id here.
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Close-auction Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error closing auction." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

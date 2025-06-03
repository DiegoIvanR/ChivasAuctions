// supabase/functions/close-auctions/index.ts
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.15.0";

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2022-11-15",
  });

  const { data: auctions, error: auctionErr } = await supabase
    .from("auctions")
    .select("auction_id, end_time")
    .eq("auction_status", "live")
    .lte("end_time", new Date().toISOString());

  if (auctionErr) {
    console.error("Auction fetch error:", auctionErr);
    return new Response("Auction fetch error", { status: 500 });
  }

  for (const auction of auctions ?? []) {
    const { data: highestBid, error: bidErr } = await supabase
      .from("bids")
      .select("bid_id, amount, bidder_id, payment_intent_id")
      .eq("auction_id", auction.auction_id)
      .order("amount", { ascending: false })
      .limit(1)
      .single();

    if (bidErr || !highestBid) {
      console.warn(`No valid bids for auction ${auction.auction_id}`);
      await supabase
        .from("auctions")
        .update({ auction_status: "closed" })
        .eq("auction_id", auction.auction_id);
      continue;
    }

    // Capture the payment
    try {
      const paymentIntent = await stripe.paymentIntents.capture(
        highestBid.payment_intent_id
      );

      // Record the payment
      await supabase.from("payments").insert({
        auction_id: auction.auction_id,
        bidder_id: highestBid.bidder_id,
        amount_charged: highestBid.amount,
        stripe_charge_id: paymentIntent.latest_charge,
      });

      // Close the auction
      await supabase
        .from("auctions")
        .update({ auction_status: "closed" })
        .eq("auction_id", auction.auction_id);
    } catch (err) {
      console.error(`Stripe error for auction ${auction.auction_id}:`, err);
    }
  }

  return new Response("Auction processing complete", { status: 200 });
});

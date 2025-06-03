// supabase/functions/close-auctions/index.ts

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.15.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// We need a Supabase client with service_role privileges
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Updated section for extracting charge ID from PaymentIntent
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
  // Only allow POST (cron-triggered). You can tighten this by requiring a secret header if desired.
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // 1. Fetch all auctions with status 'live' and end_time <= now()
  const { data: liveAuctions, error: auctionsError } = await supabase
    .from("auctions")
    .select("auction_id")
    .eq("auction_status", "live")
    .lte("end_time", "now()"); // SQL: end_time <= now()

  if (auctionsError) {
    console.error("Error fetching ended auctions:", auctionsError);
    return new Response(
      JSON.stringify({ error: "Error fetching ended auctions." }),
      { status: 500 }
    );
  }

  // If no auctions to close, just return 200
  if (!liveAuctions || liveAuctions.length === 0) {
    return new Response(JSON.stringify({ message: "No auctions to close." }), {
      status: 200,
    });
  }

  // 2. Loop over each auction and process
  for (const auction of liveAuctions) {
    const auctionId = auction.auction_id;

    // 2a. Find highest bid for this auction_id
    const { data: topBidArr, error: bidError } = await supabase
      .from("bids")
      .select("bid_id, bidder_id, amount, payment_intent_id")
      .eq("auction_id", auctionId)
      .order("amount", { ascending: false })
      .limit(1);

    if (bidError) {
      console.error(`Error fetching top bid for auction ${auctionId}:`, bidError);
      // Skip to next auction
      continue;
    }

    if (!topBidArr || topBidArr.length === 0) {
      // No bids → just close auction without payment record
      const { error: closeError } = await supabase
        .from("auctions")
        .update({ auction_status: "closed", updated_at: "now()" })
        .eq("auction_id", auctionId);

      if (closeError) {
        console.error(`Error closing auction ${auctionId}:`, closeError);
      }
      continue;
    }

    const topBid = topBidArr[0];
    const { bidder_id, amount, payment_intent_id } = topBid;
    let chargeId: string | null = null;

    try {
      console.log(`Processing payment for auction ${auctionId}, PaymentIntent: ${payment_intent_id}`);
      
      // 1) Retrieve the current PaymentIntent
      const pi = await stripe.paymentIntents.retrieve(payment_intent_id);
      console.log(`PaymentIntent status: ${pi.status} for auction ${auctionId}`);
    
      if (pi.status === "requires_confirmation") {
        console.log(`Confirming PaymentIntent ${payment_intent_id}`);
        
        // First, confirm the PaymentIntent - need to provide return_url for redirect-based payment methods
        const confirmed = await stripe.paymentIntents.confirm(payment_intent_id, {
          return_url: "https://www.google.com" // Required for redirect-based payment methods
        });
        console.log(`PaymentIntent confirmed, new status: ${confirmed.status}`);

        // Wait a moment for the confirmation to process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // After confirmation, it should be "requires_capture" or "succeeded"
        if (confirmed.status === "requires_capture") {
          console.log(`Capturing PaymentIntent ${payment_intent_id}`);
          const captured = await stripe.paymentIntents.capture(payment_intent_id);
          console.log(`PaymentIntent captured, status: ${captured.status}`);
          
          // Extract charge ID from captured payment
          chargeId = extractChargeId(captured);
          if (chargeId) {
            console.log(`Charge ID obtained: ${chargeId}`);
          } else {
            console.warn(`No charge ID found in captured PaymentIntent ${payment_intent_id}`);
          }
        } else if (confirmed.status === "succeeded") {
          // Payment was automatically captured
          chargeId = extractChargeId(confirmed);
          if (chargeId) {
            console.log(`Charge ID from succeeded payment: ${chargeId}`);
          } else {
            console.warn(`No charge ID found in succeeded PaymentIntent ${payment_intent_id}`);
          }
        } else {
          console.warn(`Unexpected status after confirmation: ${confirmed.status} for PaymentIntent ${payment_intent_id}`);
        }
      }
      else if (pi.status === "requires_capture") {
        console.log(`Capturing already-confirmed PaymentIntent ${payment_intent_id}`);
        
        // If it's already confirmed but not yet captured, just capture
        const captured = await stripe.paymentIntents.capture(payment_intent_id);
        console.log(`PaymentIntent captured, status: ${captured.status}`);
        
        chargeId = extractChargeId(captured);
        if (chargeId) {
          console.log(`Charge ID obtained: ${chargeId}`);
        } else {
          console.warn(`No charge ID found in captured PaymentIntent ${payment_intent_id}`);
        }
      }
      else if (pi.status === "succeeded") {
        console.log(`PaymentIntent ${payment_intent_id} already succeeded`);
        
        // If it's already been captured earlier, just grab the existing Charge ID
        chargeId = extractChargeId(pi);
        if (chargeId) {
          console.log(`Existing charge ID: ${chargeId}`);
        } else {
          console.warn(`No charge ID found in succeeded PaymentIntent ${payment_intent_id}`);
        }
      } else {
        // Some other unexpected state—log it for debugging
        console.warn(
          `PaymentIntent ${payment_intent_id} for auction ${auctionId} is in unexpected status ${pi.status}`
        );
      }
    } catch (stripeErr) {
      console.error(
        `Stripe error when processing payment_intent ${payment_intent_id} for auction ${auctionId}:`,
        stripeErr
      );
      // Log the full error object for debugging
      console.error("Full Stripe error:", JSON.stringify(stripeErr, null, 2));
    }

    // 2c. Insert into payments table
    const { data: paymentData, error: paymentInsertError } = await supabase
      .from("payments")
      .insert([
        {
          auction_id: auctionId,
          bidder_id: bidder_id,
          amount_charged: amount,
          stripe_charge_id: chargeId,
        },
      ])
      .select();

    console.log("Final values - Charge ID:", chargeId, "Auction ID:", auctionId, "Bidder ID:", bidder_id);
    console.log("Payment data inserted:", paymentData);
    
    if (paymentInsertError) {
      console.error(
        `Error inserting payment record for auction ${auctionId}, bidder ${bidder_id}:`,
        paymentInsertError
      );
      // Even if this fails, we still close the auction below
    }

    // 2d. Finally, close the auction
    const { error: closeError2 } = await supabase
      .from("auctions")
      .update({
        auction_status: "closed",
        updated_at: new Date().toISOString(),
      })
      .eq("auction_id", auctionId);

    if (closeError2) {
      console.error(`Error updating auction ${auctionId} to closed:`, closeError2);
    }
  }

  return new Response(JSON.stringify({ message: "Auctions processed." }), {
    status: 200,
  });
});

// supabase/functions/close-auctions/index.ts
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.15.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Supabase client with service_role privileges
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

serve(async (req) => {
  // Will accumulate debug messages to return in the HTTP response
  const debugLogs: string[] = [];

  // Only accept POST
  if (req.method !== "POST") {
    debugLogs.push("🔴 Method not allowed: only POST is supported.");
    return new Response(
      JSON.stringify({ error: "Method Not Allowed", logs: debugLogs }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  // 1. Fetch all auctions with status='live' and end_time <= now()
  debugLogs.push("➡️ Fetching live auctions that have ended...");
  const { data: liveAuctions, error: auctionsError } = await supabase
    .from("auctions")
    .select("auction_id")
    .eq("auction_status", "live")
    .lte("end_time", "now()");

  if (auctionsError) {
    debugLogs.push(`❌ Error fetching ended auctions: ${JSON.stringify(auctionsError)}`);
    return new Response(
      JSON.stringify({ error: "Error fetching ended auctions.", logs: debugLogs }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!liveAuctions || liveAuctions.length === 0) {
    debugLogs.push("ℹ️ No auctions to close right now.");
    return new Response(
      JSON.stringify({ message: "No auctions to close.", logs: debugLogs }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  debugLogs.push(`ℹ️ Found ${liveAuctions.length} auction(s) to process.`);

  // 2. Loop over each ended auction
  const overallResults: {
    auction_id: string;
    status: string;
    payment?: { chargeId: string; supabaseRow?: any };
    error?: string;
  }[] = [];

  for (const auction of liveAuctions) {
    const auctionId = auction.auction_id;
    debugLogs.push(`\n---\n🔄 Processing auction ${auctionId}`);

    // 2a. Find the highest bid for this auction
    const { data: topBidArr, error: bidError } = await supabase
      .from("bids")
      .select("bid_id, bidder_id, amount, payment_intent_id")
      .eq("auction_id", auctionId)
      .order("amount", { ascending: false })
      .limit(1);

    if (bidError) {
      const msg = `❌ Error fetching top bid for auction ${auctionId}: ${JSON.stringify(bidError)}`;
      debugLogs.push(msg);
      overallResults.push({ auction_id: auctionId, status: "bidFetchError", error: msg });
      continue; // Skip this auction
    }

    if (!topBidArr || topBidArr.length === 0) {
      const msg = `ℹ️ Auction ${auctionId} has no bids → closing without payment.`;
      debugLogs.push(msg);
      // Close the auction
      const { error: closeErr } = await supabase
        .from("auctions")
        .update({
          auction_status: "closed",
          updated_at: new Date().toISOString(),
        })
        .eq("auction_id", auctionId);

      if (closeErr) {
        const errMsg = `❌ Error closing auction ${auctionId}: ${JSON.stringify(closeErr)}`;
        debugLogs.push(errMsg);
        overallResults.push({ auction_id: auctionId, status: "closeError", error: errMsg });
      } else {
        debugLogs.push(`✅ Auction ${auctionId} closed.`);
        overallResults.push({ auction_id: auctionId, status: "closedNoBids" });
      }
      continue;
    }

    const { bidder_id, amount, payment_intent_id } = topBidArr[0];
    debugLogs.push(`ℹ️ Top bid: bidder=${bidder_id}, amount=${amount}, pi=${payment_intent_id}`);

    // 2b. Attempt to confirm and capture the PaymentIntent
    let chargeId: string | null = null;
    try {
      // Retrieve and expand to see charges array
      const pi = await stripe.paymentIntents.retrieve(payment_intent_id, {
        expand: ["charges.data"],
      });
      debugLogs.push(`🔍 PI status before anything: ${pi.status}`);
      debugLogs.push(`🔍 PI.charges.data (pre‐capture): ${JSON.stringify(pi.charges.data)}`);

      if (pi.status === "requires_confirmation") {
        debugLogs.push(`➡️ Confirming PI ${payment_intent_id}...`);
        const confirmed = await stripe.paymentIntents.confirm(payment_intent_id, {
          expand: ["charges.data"],
          // return_url: "https://your-domain.com/confirm-return" // only if needed
        });
        debugLogs.push(`✔️ Confirmed PI status: ${confirmed.status}`);
        debugLogs.push(`✔️ Confirmed.charges.data: ${JSON.stringify(confirmed.charges.data)}`);

        debugLogs.push(`➡️ Capturing PI ${payment_intent_id}...`);
        const captured = await stripe.paymentIntents.capture(payment_intent_id, {
          expand: ["charges.data"],
        });
        debugLogs.push(`✅ Captured PI status: ${captured.status}`);
        debugLogs.push(`✅ Captured.charges.data: ${JSON.stringify(captured.charges.data)}`);

        if (captured.charges.data.length > 0) {
          chargeId = captured.charges.data[0].id;
          debugLogs.push(`ℹ️ Retrieved chargeId after capture: ${chargeId}`);
        }
      } else if (pi.status === "requires_capture") {
        debugLogs.push(`➡️ PI already “requires_capture,” so capturing now (${payment_intent_id})...`);
        const captured = await stripe.paymentIntents.capture(payment_intent_id, {
          expand: ["charges.data"],
        });
        debugLogs.push(`✅ Captured PI status: ${captured.status}`);
        debugLogs.push(`✅ Captured.charges.data: ${JSON.stringify(captured.charges.data)}`);

        if (captured.charges.data.length > 0) {
          chargeId = captured.charges.data[0].id;
          debugLogs.push(`ℹ️ Retrieved chargeId after capture: ${chargeId}`);
        }
      } else if (pi.status === "succeeded") {
        debugLogs.push(`ℹ️ PI was already succeeded; charging was done earlier.`);
        if (pi.charges.data.length > 0) {
          chargeId = pi.charges.data[0].id;
          debugLogs.push(`ℹ️ Retrieved existing chargeId: ${chargeId}`);
        }
      } else {
        debugLogs.push(`⚠️ PI ${payment_intent_id} has unexpected status: ${pi.status}.`);
      }
    } catch (stripeErr) {
      const msg = `❌ Stripe error for PI ${payment_intent_id} (auction ${auctionId}): ${
        (stripeErr as any).message ?? JSON.stringify(stripeErr)
      }`;
      debugLogs.push(msg);
      overallResults.push({ auction_id: auctionId, status: "stripeError", error: msg });
      // Skip to next auction, but first close the auction so we don't retry forever
      await supabase
        .from("auctions")
        .update({
          auction_status: "closed",
          updated_at: new Date().toISOString(),
        })
        .eq("auction_id", auctionId);
      continue;
    }

    // 2c. If chargeId is still null, log and skip inserting
    if (!chargeId) {
      const msg = `⚠️ chargeId is null for auction ${auctionId}, bidder ${bidder_id}; skipping insert.`;
      debugLogs.push(msg);
      // We still close the auction so it doesn’t re-run
      const { error: closeErr2 } = await supabase
        .from("auctions")
        .update({
          auction_status: "closed",
          updated_at: new Date().toISOString(),
        })
        .eq("auction_id", auctionId);

      if (closeErr2) {
        const errMsg = `❌ Error closing auction ${auctionId} after missing chargeId: ${JSON.stringify(closeErr2)}`;
        debugLogs.push(errMsg);
        overallResults.push({ auction_id: auctionId, status: "closeErrorNoCharge", error: errMsg });
      } else {
        debugLogs.push(`✅ Auction ${auctionId} closed (no payment recorded).`);
        overallResults.push({ auction_id: auctionId, status: "closedNoCharge" });
      }
      continue;
    }

    // 2d. Now that we have a chargeId, insert into payments
    debugLogs.push(`⬇️ Inserting into payments (chargeId=${chargeId}) for auction ${auctionId}...`);
    const insertPayload = [
      {
        auction_id: auctionId,
        bidder_id: bidder_id,
        amount_charged: amount,
        stripe_charge_id: chargeId,
        created_at: new Date().toISOString(), // remove if your schema has DEFAULT now()
      },
    ];

    debugLogs.push(`📝 insertPayload: ${JSON.stringify(insertPayload)}`);
    const { data: paymentData, error: paymentInsertError } = await supabase
      .from("payments")
      .insert(insertPayload)
      .select();

    if (paymentInsertError) {
      const msg = `❌ Error inserting payment record for auction ${auctionId}, bidder ${bidder_id}: ${
        JSON.stringify(paymentInsertError)
      }`;
      debugLogs.push(msg);
      overallResults.push({
        auction_id: auctionId,
        status: "paymentInsertError",
        error: msg,
      });
    } else {
      debugLogs.push(`✅ Payment record inserted: ${JSON.stringify(paymentData)}`);
      overallResults.push({
        auction_id: auctionId,
        status: "paymentInserted",
        payment: { chargeId, supabaseRow: paymentData },
      });
    }

    // 2e. Finally, close the auction
    const { error: closeErrorFinal } = await supabase
      .from("auctions")
      .update({
        auction_status: "closed",
        updated_at: new Date().toISOString(),
      })
      .eq("auction_id", auctionId);

    if (closeErrorFinal) {
      const errMsg = `❌ Error updating auction ${auctionId} to closed: ${JSON.stringify(closeErrorFinal)}`;
      debugLogs.push(errMsg);
      overallResults.push({ auction_id: auctionId, status: "closeErrorAfterPayment", error: errMsg });
    } else {
      debugLogs.push(`✅ Auction ${auctionId} marked “closed.”`);
    }
  }

  // 3. Return final JSON with all debugLogs and overallResults
  return new Response(
    JSON.stringify({
      message: "Auctions processed.",
      results: overallResults,
      logs: debugLogs,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});

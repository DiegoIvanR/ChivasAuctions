import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "./supabaseClient"; // Adjust the path to your Supabase client
import './payment-setup.css';

export default function PaymentSetup() {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function createStripeCustomer() {
        try {
            const user = supabase.auth.user();
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("full_name, stripe_customer_id")
                .eq("id", user.id)
                .single();

            if (profileError) throw profileError;

            const res = await fetch(
                "https://tlhejbmdwowbhcyviydm.functions.supabase.co/create-stripe-customer",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: user.id,
                        email: user.email,
                        full_name: profile.full_name,
                    }),
                }
            );

            if (!res.ok) throw new Error("Failed to create Stripe customer");

            const { client_secret } = await res.json();
            return client_secret;
        } catch (err) {
            console.error("Error creating Stripe customer:", err);
            setError("Failed to create Stripe customer. Please try again.");
            throw err;
        }
    }

    async function attachCard() {
        setLoading(true);
        setError(null);

        try {
            const clientSecret = await createStripeCustomer();

            const cardElement = elements.getElement(CardElement);
            if (!cardElement) throw new Error("CardElement not found");

            const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: supabase.auth.user().full_name,
                        email: supabase.auth.user().email,
                    },
                },
            });

            if (stripeError) throw stripeError;

            console.log("Card successfully attached:", setupIntent.payment_method);
            alert("Your card is on file! You can now place bids.");
        } catch (err) {
            console.error("Card setup failed:", err);
            setError("Failed to attach card. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="payment-setup">
            <h2>Setup Payment Method</h2>
            <p>Enter your card details below to save your payment method.</p>
            <div className="card-element-container">
                <CardElement />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button onClick={attachCard} disabled={!stripe || loading} className="payment-button">
                {loading ? "Processing..." : "Add Payment Method"}
            </button>
        </div>
    );
}
import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useSelector } from "react-redux"; // Import useSelector to access Redux store
import { supabase } from "./supabaseClient"; // Adjust the path to your Supabase client
import './payment-setup.css';

export default function PaymentSetup() {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get user data from Redux store
    const user = useSelector((state) => state.auth.user);

    async function createStripeCustomer() {
        try {
            if (!user || !user.id) {
                throw new Error("User is not authenticated or user ID is missing.");
            }

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("full_name, stripe_customer_id")
                .eq("id", user.id)
                .single();

            if (profileError) throw profileError;

            // If stripe_customer_id already exists, return it
            if (profile.stripe_customer_id) {
                console.log("Stripe customer already exists:", profile.stripe_customer_id);
                return profile.stripe_customer_id;
            }

            // Create a new Stripe customer via Supabase function
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

            const { stripe_customer_id, client_secret } = await res.json();

            // Update stripe_customer_id in public.profiles table
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ stripe_customer_id })
                .eq("id", user.id);

            if (updateError) throw updateError;

            console.log("Stripe customer ID saved to profile:", stripe_customer_id);
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
                        name: user.full_name || "Default Name",
                        email: user.email || "default@example.com",
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
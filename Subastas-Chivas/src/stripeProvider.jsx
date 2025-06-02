
// src/stripeProvider.js
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import React from "react";

// Carga tu publishable key
const stripePromise = loadStripe('pk_test_51RTkCSBSXB0u2ceFU5ZzPmsrITQPFU3ALvjt2r1rN8ov7fcM5j4YKKqUh4RXFiB5p2UsPVfee9U40oFIaVTapInu0068ksRGdk'); // Replace with your Stripe publishable key

export function StripeProvider({ children }) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}

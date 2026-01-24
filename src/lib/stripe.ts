import Stripe from 'stripe';

// Only initialize Stripe if the secret key is provided
export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-12-18.acacia',
        typescript: true,
    })
    : null;

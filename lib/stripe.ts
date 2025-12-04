import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

export const formatAmountForDisplay = (
  amount: number,
  currency: string = 'eur'
): string => {
  const numberFormat = new Intl.NumberFormat(['fr-FR'], {
    style: 'currency',
    currency: currency.toUpperCase(),
  });
  return numberFormat.format(amount / 100);
};

export const formatAmountForStripe = (
  amount: number,
  currency: string = 'eur'
): number => {
  return Math.round(amount * 100);
};


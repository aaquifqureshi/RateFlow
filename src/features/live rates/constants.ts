export const TOP_CURRENCIES = [
  "USD",
  "EUR",
  "JPY",
  "HKD",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "GBP",
  "NZD",
  "SGD",
  "INR",
  "DKK",
] as const;

export type CurrencyCode = (typeof TOP_CURRENCIES)[number];

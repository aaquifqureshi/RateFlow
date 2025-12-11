export function iconPathFor(code?: string) {
  if (!code) return "";
  return `/icons/${code.toLowerCase()}.png`;
}

export function getFlagEmoji(code?: string) {
  if (!code) return "";
  const cc = code.slice(0, 2).toUpperCase();
  return cc.replace(/./g, (c) =>
    String.fromCodePoint(127397 + c.charCodeAt(0))
  );
}

export const SYMBOL_FALLBACK: Record<string, string> = {
  USD: "$",
  EUR: "€",
  INR: "₹",
  JPY: "¥",
  GBP: "£",
  BTC: "₿",
  ETH: "Ξ",
  XAU: "Au",
  XAG: "Ag",
};
export function symbolFor(code?: string) {
  if (!code) return "";
  return SYMBOL_FALLBACK[code.toUpperCase()] ?? code.toUpperCase();
}

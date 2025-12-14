export function iconPathFor(code?: string) {
  if (!code) return "";
  return `/icons/${code.toLowerCase()}.png`;
}

export function getFlagEmoji(code?: string) {
  if (!code) return "";
  const cc = code.slice(0, 3).toUpperCase();
  return cc.replace(/./g, (c) =>
    String.fromCodePoint(127397 + c.charCodeAt(0))
  );
}

export const ENFORCE_MARKET_HOURS = true;

const MARKET_OPEN_HOUR = 9;
const MARKET_OPEN_MINUTE = 0;
const MARKET_CLOSE_HOUR = 15;
const MARKET_CLOSE_MINUTE = 30;

export function isMarketOpen() {
  if (!ENFORCE_MARKET_HOURS) return true;

  const now = new Date();
  const day = now.getDay(); 

  if (day === 0 || day === 6) return false;

  const openMinutes = MARKET_OPEN_HOUR * 60 + MARKET_OPEN_MINUTE;
  const closeMinutes = MARKET_CLOSE_HOUR * 60 + MARKET_CLOSE_MINUTE;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}

export function getMarketStatusMessage() {
  return "The stock market is currently closed. Trading hours are 9:00 AM – 3:30 PM (Mon–Fri). You can still browse stocks, but buy/sell is disabled until it reopens.";
}
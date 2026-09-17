import { isMarketOpen, getMarketStatusMessage, ENFORCE_MARKET_HOURS } from "../config/marketConfig";

function MarketStatusBanner() {
  if (!ENFORCE_MARKET_HOURS) return null;
  if (isMarketOpen()) return null;

  return (
    <div className="market-closed-banner">
      ⏰ {getMarketStatusMessage()}
    </div>
  );
}

export default MarketStatusBanner;
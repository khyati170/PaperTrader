import { useEffect, useState } from "react";
import {Link} from "react-router-dom";
import { getStocks } from "../data/stocks";
import "./Portfolio.css";
import MarketStatusBanner from "../components/MarketStatusBanner";

function Portfolio({ balance, holdings, onSell }) {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sellQty, setSellQty] = useState({});

  useEffect(() => {
    getStocks()
      .then((data) => {
        setStocks(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const holdingSymbols = Object.keys(holdings);

  // attach live current price to each holding
  // const enrichedHoldings = holdingSymbols.map((symbol) => {
  //   const { quantity, avgBuyPrice } = holdings[symbol];
  //   const liveStock = stocks.find((s) => s.symbol === symbol);
  //   const currentPrice = liveStock ? liveStock.price : avgBuyPrice;
  const enrichedHoldings = holdingSymbols
  .map((symbol) => {
    const quantity = Number(holdings[symbol]?.quantity) || 0;
    const avgBuyPrice = Number(holdings[symbol]?.avgBuyPrice) || 0;

    if (quantity <= 0) return null;

    const liveStock = stocks.find((s) => s.symbol === symbol);
    const currentPrice = liveStock ? Number(liveStock.price) || avgBuyPrice : avgBuyPrice;
    const currentValue = currentPrice * quantity;
    const investedValue = avgBuyPrice * quantity;
    const gain = currentValue - investedValue;
    const gainPercent = investedValue > 0 ? (gain / investedValue) * 100 : 0;

    return { symbol, quantity, avgBuyPrice, currentPrice, currentValue, gain, gainPercent };
  })
  .filter(Boolean);

  const totalCurrentValue = enrichedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalInvested = enrichedHoldings.reduce((sum, h) => sum + h.avgBuyPrice * h.quantity, 0);
  const totalProfit = totalCurrentValue - totalInvested;

  function handleSellClick(symbol, currentPrice) {
    const qty = Number(sellQty[symbol]) || 1;
    if (qty <= 0) return;
    onSell(symbol, currentPrice, qty);
    setSellQty((prev) => ({ ...prev, [symbol]: "" }));
  }

  if (isLoading) {
    return <p className="portfolio-loading">Loading your portfolio...</p>;
  }

  return (
    <div className="portfolio-page">
      <h1 className="page-title">Portfolio</h1>
      <MarketStatusBanner/>

      <div className="portfolio-summary">
        <div className="summary-card">
          <p className="summary-label">Available Balance</p>
          <p className="summary-value">${balance.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Current Holdings Value</p>
          <p className="summary-value">${totalCurrentValue.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Total Profit / Loss</p>
          <p className={`summary-value ${totalProfit >= 0 ? "gain" : "loss"}`}>
            {totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="portfolio-heading">
        <h2 className="section-heading">Your Stocks</h2>
        <Link to="/market" className="market-btn">
          Go to Market
        </Link>
      </div>

      {enrichedHoldings.length === 0 ? (
        <p className="empty-state">You don't own any stocks yet. Head to the Market to start trading.</p>
      ) : (
        <div className="holdings-table-wrap">
          <table className="holdings-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Qty</th>
                <th>Avg Buy Price</th>
                <th>Current Price</th>
                <th>Current Value</th>
                <th>Gain / Loss</th>
                <th>Sell</th>
              </tr>
            </thead>
            <tbody>
              {enrichedHoldings.map((h) => (
                <tr key={h.symbol}>
                  <td className="symbol-cell">{h.symbol}</td>
                  <td>{h.quantity}</td>
                  <td>${h.avgBuyPrice.toFixed(2)}</td>
                  <td>${h.currentPrice.toFixed(2)}</td>
                  <td>${h.currentValue.toFixed(2)}</td>
                  <td className={h.gain >= 0 ? "gain" : "loss"}>
                    {h.gain >= 0 ? "+" : ""}${h.gain.toFixed(2)} ({h.gainPercent.toFixed(1)}%)
                  </td>
                  <td>
                    <div className="sell-cell">
                      <input
                        type="number"
                        min="1"
                        max={h.quantity}
                        placeholder="Qty"
                        value={sellQty[h.symbol] || ""}
                        onChange={(e) =>
                          setSellQty((prev) => ({ ...prev, [h.symbol]: e.target.value }))
                        }
                        className="sell-qty-input"
                      />
                      <button
                        className="sell-btn"
                        onClick={() => handleSellClick(h.symbol, h.currentPrice)}
                      >
                        Sell
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Portfolio;
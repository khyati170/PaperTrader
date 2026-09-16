import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getStocks } from "../data/stocks.js";
import "./Portfolio.css";

function Portfolio({ balance, holdings }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getStocks().then((allStocks) => {
      if (!isMounted) return;
      setStocks(allStocks);
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return <p className="loading-text">Loading portfolio...</p>;
  }


  const rows = Object.entries(holdings).map(([symbol, data]) => {
    const liveStock = stocks.find((s) => s.symbol === symbol);
    const avgBuyPrice = Number(data.avgBuyPrice) || 0;
    const quantity = Number(data.quantity) || 0;
    const currentPrice = Number(liveStock?.price) || avgBuyPrice;

    const investedValue = avgBuyPrice * quantity;
    const currentValue = currentPrice * quantity;
    const profit = currentValue - investedValue;
    const profitPercent = investedValue > 0 ? (profit / investedValue) * 100 : 0;

    return { symbol, quantity, avgBuyPrice, currentPrice, investedValue, currentValue, profit, profitPercent };
  });

  const totalInvested = rows.reduce((sum, r) => sum + r.investedValue, 0);
  const totalCurrentValue = rows.reduce((sum, r) => sum + r.currentValue, 0);
  const totalProfit = totalCurrentValue - totalInvested;
  const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  return (
    <main className="portfolio-page">
      <h1>My Portfolio</h1>

      <section className="portfolio-summary">
        <div className="summary-card">
          <p className="label">Available Balance</p>
          <p className="value">${balance.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <p className="label">Invested Value</p>
          <p className="value">${totalInvested.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <p className="label">Current Value</p>
          <p className="value">${totalCurrentValue.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <p className="label">Total Profit/Loss</p>
          <p className={totalProfit >= 0 ? "positive-text" : "negative-text"}>
            {totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(2)} ({totalProfitPercent.toFixed(2)}%)
          </p>
        </div>
      </section>

      <table className="portfolio-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Qty</th>
            <th>Avg Buy Price</th>
            <th>Current Price</th>
            <th>Current Value</th>
            <th>Profit/Loss</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="6">
                No holdings yet. <Link to="/market">Browse the market</Link> to start trading.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.symbol}>
                <td><Link to={`/stock/${r.symbol}`}>{r.symbol}</Link></td>
                <td>{r.quantity}</td>
                <td>${r.avgBuyPrice.toFixed(2)}</td>
                <td>${r.currentPrice.toFixed(2)}</td>
                <td>${r.currentValue.toFixed(2)}</td>
                <td className={r.profit >= 0 ? "positive-text" : "negative-text"}>
                  {r.profit >= 0 ? "+" : ""}${r.profit.toFixed(2)} ({r.profitPercent.toFixed(2)}%)
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}

export default Portfolio;
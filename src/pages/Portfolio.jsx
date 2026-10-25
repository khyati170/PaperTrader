import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { getStocks } from "../data/stocks";
import "./Portfolio.css";
import MarketStatusBanner from "../components/MarketStatusBanner";
import TradeModal from "../components/TradeModal";

const CHART_COLORS = [
  "#2a9d8f", "#e07a5f", "#3d5a80", "#e9c46a",
  "#8d6aa8", "#6a994e", "#d1495b", "#00798c",
];

const MAX_SLICES = 8;

function Portfolio({ balance, holdings, transactions = [], onSell }) {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupBy, setGroupBy] = useState("stock");
  const [sellSymbol, setSellSymbol] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    getStocks()
      .then((result) => {
        if (!isMounted) return;
        setStocks(result?.stocks || []);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!showSuccess) return;
    const id = setTimeout(() => setShowSuccess(false), 2500);
    return () => clearTimeout(id);
  }, [showSuccess]);

  const holdingSymbols = Object.keys(holdings);

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

  const groupedValues = {};
  enrichedHoldings.forEach((h) => {
    const key =
      groupBy === "sector"
        ? stocks.find((s) => s.symbol === h.symbol)?.sector || "Other"
        : h.symbol;
    groupedValues[key] = (groupedValues[key] || 0) + h.currentValue;
  });

  let allocationData = Object.entries(groupedValues)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (allocationData.length > MAX_SLICES) {
    const top = allocationData.slice(0, MAX_SLICES - 1);
    const otherValue = allocationData
      .slice(MAX_SLICES - 1)
      .reduce((sum, item) => sum + item.value, 0);
    allocationData = [...top, { name: "Other", value: otherValue }];
  }

  allocationData = allocationData.map((item, i) => ({
    ...item,
    color: CHART_COLORS[i],
    percent: totalCurrentValue > 0 ? (item.value / totalCurrentValue) * 100 : 0,
  }));

  const sellTarget = enrichedHoldings.find((h) => h.symbol === sellSymbol) || null;

  function handleConfirmSell(qty) {
    if (!sellTarget) return false;
    const { symbol, currentPrice } = sellTarget;

    const ok = onSell(symbol, currentPrice, qty);
    if (ok === false) return false; // modal khula rahega

    setSellSymbol(null);
    setSuccessMessage(
      `Sold ${qty} share(s) of ${symbol} for $${(qty * currentPrice).toFixed(2)}.`
    );
    setShowSuccess(true);
    return true;
  }

  if (isLoading) {
    return <p className="portfolio-loading">Loading your portfolio...</p>;
  }

  return (
    <div className="portfolio-page">
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-box">
            <span className="success-icon">✅</span>
            <h2>Success!</h2>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      <h1 className="page-title">Portfolio</h1>
      <MarketStatusBanner />

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

      {enrichedHoldings.length > 0 && (
        <div className="allocation-card">
          <div className="allocation-header">
            <h2 className="section-heading">Portfolio Allocation</h2>
            <div className="allocation-toggle">
              <button
                className={groupBy === "stock" ? "toggle-btn active" : "toggle-btn"}
                onClick={() => setGroupBy("stock")}
              >
                By Stock
              </button>
              <button
                className={groupBy === "sector" ? "toggle-btn active" : "toggle-btn"}
                onClick={() => setGroupBy("sector")}
              >
                By Sector
              </button>
            </div>
          </div>

          <div className="allocation-body">
            <div className="allocation-chart">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={2}
                    stroke="var(--color-bg)"
                    strokeWidth={2}
                  >
                    {allocationData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="allocation-tooltip">
                          <strong>{d.name}</strong>
                          <span>${d.value.toFixed(2)} · {d.percent.toFixed(1)}%</span>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="allocation-center">
                <span className="allocation-center-label">Total</span>
                <span className="allocation-center-value">${totalCurrentValue.toFixed(0)}</span>
              </div>
            </div>

            <ul className="allocation-legend">
              {allocationData.map((item) => (
                <li key={item.name}>
                  <span className="legend-dot" style={{ background: item.color }} />
                  <span className="legend-name">{item.name}</span>
                  <span className="legend-percent">{item.percent.toFixed(1)}%</span>
                  <span className="legend-value">${item.value.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="portfolio-heading">
        <h2 className="section-heading">Your Stocks</h2>
        <Link to="/market" className="market-btn">
          Go to Market
        </Link>
      </div>

      {enrichedHoldings.length === 0 ? (
        <p className="empty-state">
          You don't own any stocks yet. Head to the Market to start trading.
        </p>
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
                      <button
                        className="sell-btn"
                        onClick={() => setSellSymbol(h.symbol)}
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

      {/* ---------- Transaction History ---------- */}
      <div className="portfolio-heading">
        <h2 className="section-heading">Transaction History</h2>
      </div>

      {transactions.length === 0 ? (
        <p className="empty-state">No transactions yet.</p>
      ) : (
        <div className="holdings-table-wrap">
          <table className="holdings-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Symbol</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.date).toLocaleString()}</td>
                  <td className={t.type === "BUY" ? "gain" : "loss"}>{t.type}</td>
                  <td className="symbol-cell">{t.symbol}</td>
                  <td>{t.quantity}</td>
                  <td>${Number(t.price).toFixed(2)}</td>
                  <td>${Number(t.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- Sell modal ---------- */}
      <TradeModal
        isOpen={sellTarget !== null}
        mode="sell"
        stock={sellTarget ? { symbol: sellTarget.symbol, price: sellTarget.currentPrice } : null}
        ownedShares={sellTarget?.quantity || 0}
        avgBuyPrice={sellTarget?.avgBuyPrice || 0}
        balance={balance}
        onConfirm={handleConfirmSell}
        onCancel={() => setSellSymbol(null)}
      />
    </div>
  );
}

export default Portfolio;
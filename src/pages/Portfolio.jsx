import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";
import { getStocks } from "../data/stocks";
import "./Portfolio.css";
import MarketStatusBanner from "../components/MarketStatusBanner";
import TradeModal from "../components/TradeModal";

const CHART_COLORS = [
  "#2a9d8f",
  "#e07a5f",
  "#3d5a80",
  "#e9c46a",
  "#8d6aa8",
  "#6a994e",
  "#d1495b",
  "#00798c",
];

const MAX_SLICES = 8;

function Portfolio({
  balance,
  holdings,
  transactions = [],
  onSell,
}) {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupBy, setGroupBy] = useState("stock");

  const [sellSymbol, setSellSymbol] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  // Fetch stock data
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

    return () => {
      isMounted = false;
    };
  }, []);

  // Hide success message after 2.5 seconds
  useEffect(() => {
    if (!showSuccess) return;

    const id = setTimeout(() => {
      setShowSuccess(false);
    }, 2500);

    return () => clearTimeout(id);
  }, [showSuccess]);

  // Calculate holdings using current stock prices
  const holdingSymbols = Object.keys(holdings || {});

  const enrichedHoldings = holdingSymbols
    .map((symbol) => {
      const quantity =
        Number(holdings[symbol]?.quantity) || 0;

      const avgBuyPrice =
        Number(holdings[symbol]?.avgBuyPrice) || 0;

      if (quantity <= 0) return null;

      const liveStock = stocks.find(
        (stock) => stock.symbol === symbol
      );

      const currentPrice = liveStock
        ? Number(liveStock.price) || avgBuyPrice
        : avgBuyPrice;

      const currentValue = currentPrice * quantity;
      const investedValue = avgBuyPrice * quantity;

      const gain = currentValue - investedValue;

      const gainPercent =
        investedValue > 0
          ? (gain / investedValue) * 100
          : 0;

      return {
        symbol,
        quantity,
        avgBuyPrice,
        currentPrice,
        currentValue,
        gain,
        gainPercent,
      };
    })
    .filter(Boolean);

  // Portfolio totals
  const totalCurrentValue = enrichedHoldings.reduce(
    (sum, holding) => sum + holding.currentValue,
    0
  );

  const totalInvested = enrichedHoldings.reduce(
    (sum, holding) =>
      sum + holding.avgBuyPrice * holding.quantity,
    0
  );

  const totalProfit = totalCurrentValue - totalInvested;

  // Group allocation by stock or sector
  const groupedValues = {};

  enrichedHoldings.forEach((holding) => {
    const stock = stocks.find(
      (item) => item.symbol === holding.symbol
    );

    const key =
      groupBy === "sector"
        ? stock?.sector || "Other"
        : holding.symbol;

    groupedValues[key] =
      (groupedValues[key] || 0) + holding.currentValue;
  });

  let allocationData = Object.entries(groupedValues)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  // Combine smaller slices into Other
  if (allocationData.length > MAX_SLICES) {
    const top = allocationData.slice(0, MAX_SLICES - 1);

    const otherValue = allocationData
      .slice(MAX_SLICES - 1)
      .reduce((sum, item) => sum + item.value, 0);

    allocationData = [
      ...top,
      {
        name: "Other",
        value: otherValue,
      },
    ];
  }

  allocationData = allocationData.map((item, index) => ({
    ...item,
    color: CHART_COLORS[index % CHART_COLORS.length],
    percent:
      totalCurrentValue > 0
        ? (item.value / totalCurrentValue) * 100
        : 0,
  }));

  // Find the stock selected for selling
  const sellTarget =
    enrichedHoldings.find(
      (holding) => holding.symbol === sellSymbol
    ) || null;

  // Confirm stock sale
  function handleConfirmSell(quantity) {
    if (!sellTarget) return false;

    const { symbol, currentPrice } = sellTarget;

    if (typeof onSell !== "function") {
      return false;
    }

    const result = onSell(
      symbol,
      currentPrice,
      quantity
    );

    if (result === false) {
      return false;
    }

    setSellSymbol(null);

    setSuccessMessage(
      `Sold ${quantity} share(s) of ${symbol} for $${(
        quantity * currentPrice
      ).toFixed(2)}.`
    );

    setShowSuccess(true);

    return true;
  }

  // Loading state
  if (isLoading) {
    return (
      <p className="portfolio-loading">
        Loading your portfolio...
      </p>
    );
  }

  return (
    <div className="portfolio-page">
      {/* Sale success message */}
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

      {/* Portfolio summary */}
      <div className="portfolio-summary">
        <div className="summary-card">
          <p className="summary-label">
            Available Balance
          </p>

          <p className="summary-value">
            ${(Number(balance) || 0).toFixed(2)}
          </p>
        </div>

        <div className="summary-card">
          <p className="summary-label">
            Current Holdings Value
          </p>

          <p className="summary-value">
            ${totalCurrentValue.toFixed(2)}
          </p>
        </div>

        <div className="summary-card">
          <p className="summary-label">
            Total Profit / Loss
          </p>

          <p
            className={`summary-value ${
              totalProfit >= 0 ? "gain" : "loss"
            }`}
          >
            {totalProfit >= 0 ? "+" : "-"}$
            {Math.abs(totalProfit).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Portfolio allocation chart */}
      {enrichedHoldings.length > 0 && (
        <div className="allocation-card">
          <div className="allocation-header">
            <h2 className="section-heading">
              Portfolio Allocation
            </h2>

            <div className="allocation-toggle">
              <button
                type="button"
                className={
                  groupBy === "stock"
                    ? "toggle-btn active"
                    : "toggle-btn"
                }
                onClick={() => setGroupBy("stock")}
              >
                By Stock
              </button>

              <button
                type="button"
                className={
                  groupBy === "sector"
                    ? "toggle-btn active"
                    : "toggle-btn"
                }
                onClick={() => setGroupBy("sector")}
              >
                By Sector
              </button>
            </div>
          </div>

          <div className="allocation-body">
            <div className="allocation-chart">
              <ResponsiveContainer
                width="100%"
                height={240}
              >
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
                      <Cell
                        key={item.name}
                        fill={item.color}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) {
                        return null;
                      }

                      const data = payload[0].payload;

                      return (
                        <div className="allocation-tooltip">
                          <strong>{data.name}</strong>

                          <span>
                            ${data.value.toFixed(2)} ·{" "}
                            {data.percent.toFixed(1)}%
                          </span>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="allocation-center">
                <span className="allocation-center-label">
                  Total
                </span>

                <span className="allocation-center-value">
                  ${totalCurrentValue.toFixed(0)}
                </span>
              </div>
            </div>

            {/* Allocation legend */}
            <ul className="allocation-legend">
              {allocationData.map((item) => (
                <li key={item.name}>
                  <span
                    className="legend-dot"
                    style={{
                      background: item.color,
                    }}
                  />

                  <span className="legend-name">
                    {item.name}
                  </span>

                  <span className="legend-percent">
                    {item.percent.toFixed(1)}%
                  </span>

                  <span className="legend-value">
                    ${item.value.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Your stocks heading */}
      <div className="portfolio-heading">
        <h2 className="section-heading">
          Your Stocks
        </h2>

        <Link to="/market" className="market-btn">
          Go to Market
        </Link>
      </div>

      {/* Holdings table */}
      {enrichedHoldings.length === 0 ? (
        <p className="empty-state">
          You don't own any stocks yet. Head to the Market
          to start trading.
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
              {enrichedHoldings.map((holding) => (
                <tr key={holding.symbol}>
                  <td className="symbol-cell">
                    {holding.symbol}
                  </td>

                  <td>{holding.quantity}</td>

                  <td>
                    ${holding.avgBuyPrice.toFixed(2)}
                  </td>

                  <td>
                    ${holding.currentPrice.toFixed(2)}
                  </td>

                  <td>
                    ${holding.currentValue.toFixed(2)}
                  </td>

                  <td
                    className={
                      holding.gain >= 0 ? "gain" : "loss"
                    }
                  >
                    {holding.gain >= 0 ? "+" : "-"}$
                    {Math.abs(holding.gain).toFixed(2)} (
                    {holding.gainPercent.toFixed(1)}%)
                  </td>

                  <td>
                    <div className="sell-cell">
                      <button
                        type="button"
                        className="sell-btn"
                        onClick={() =>
                          setSellSymbol(holding.symbol)
                        }
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

      {/* Transaction history heading */}
      <div className="portfolio-heading">
        <button
          type="button"
          className="history-toggle"
          onClick={() =>
            setShowHistory((previous) => !previous)
          }
          aria-expanded={showHistory}
        >
          <span className="section-heading">
            Transaction History ({transactions.length})
          </span>

          <span
            className={
              showHistory
                ? "history-arrow open"
                : "history-arrow"
            }
          >
            ▾
          </span>
        </button>
      </div>

      {/* Transaction history table */}
      {showHistory &&
        (transactions.length === 0 ? (
          <p className="empty-state">
            No transactions yet.
          </p>
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
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      {new Date(
                        transaction.date
                      ).toLocaleString()}
                    </td>

                    <td
                      className={
                        transaction.type === "BUY"
                          ? "gain"
                          : "loss"
                      }
                    >
                      {transaction.type}
                    </td>

                    <td className="symbol-cell">
                      {transaction.symbol}
                    </td>

                    <td>{transaction.quantity}</td>

                    <td>
                      $
                      {Number(transaction.price).toFixed(2)}
                    </td>

                    <td>
                      $
                      {Number(transaction.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {/* Sell stock modal */}
      <TradeModal
        isOpen={sellTarget !== null}
        mode="sell"
        stock={
          sellTarget
            ? {
                symbol: sellTarget.symbol,
                price: sellTarget.currentPrice,
              }
            : null
        }
        ownedShares={sellTarget?.quantity || 0}
        avgBuyPrice={sellTarget?.avgBuyPrice || 0}
        balance={Number(balance) || 0}
        onConfirm={handleConfirmSell}
        onCancel={() => setSellSymbol(null)}
      />
    </div>
  );
}

export default Portfolio;
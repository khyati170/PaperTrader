import { useEffect, useState } from "react";
import StockCard from "../components/StockCard";
import { getStocks } from "../data/stocks";
import { seedSeries } from "../utils/sparkline";

const MAX_POINTS = 40;

function WatchList({ watchlist = [], toggleWatchlist = () => {} }) {
  const [stocks, setStocks] = useState([]);
  const [history, setHistory] = useState({});

  useEffect(() => {
    getStocks().then((data) => {
      setStocks(data.stocks || []);
    });
  }, []);

  // Create price history for charts
  useEffect(() => {
    if (!stocks.length) return;

    setHistory((prev) => {
      const next = { ...prev };

      stocks.forEach((stock) => {
        if (stock.price == null) return;

        if (!next[stock.symbol]) {
          next[stock.symbol] = seedSeries(stock);
        } else {
          next[stock.symbol] = [
            ...next[stock.symbol],
            stock.price,
          ].slice(-MAX_POINTS);
        }
      });

      return next;
    });
  }, [stocks]);

  const watchlistedStocks = stocks.filter((stock) =>
    watchlist.includes(stock.symbol)
  );

  return (
    <div className="market-page">
      <div className="market-header">
        <h1>WatchList</h1>
      </div>

      <div className="stock-grid">
        {watchlistedStocks.length === 0 ? (
          <p>No stocks added to watchlist yet.</p>
        ) : (
          watchlistedStocks.map((stock) => (
            <StockCard
              key={stock.symbol}
              symbol={stock.symbol}
              company={stock.name}
              price={stock.price}
              change={stock.change}
              hp={stock.highprice}
              lp={stock.lowprice}
              op={stock.openprice}
              view="chart"
              history={history[stock.symbol] || []}
              isWatchlisted={true}
              onWatchlistClick={() => toggleWatchlist(stock.symbol)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default WatchList;
import { useEffect, useState } from "react";
import StockCard from "../components/StockCard";
import { getStocks } from "../data/stocks";

function WatchList({ watchlist = [], toggleWatchlist = () => {} }) {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    getStocks().then((data) => {
      setStocks(data);
    });
  }, []);

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
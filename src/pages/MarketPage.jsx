import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StockCard from "../components/StockCard";
import GainersLosersWidget from "../components/GainersLosersWidget";
import SkeletonCard from "../components/SkeletonCard";
import { getStocks, refreshStocks, simulateFetchFailure } from "../data/stocks";
import { seedSeries } from "../utils/sparkline";
import "./MarketPage.css";

const POLL_MS = 30000; // 30 sec
const MAX_POINTS = 40; // chart mein kitne points
const SECTOR_OPTIONS = ["IT", "Banking", "Auto", "Retail", "Entertainment", "Food"];

export default function MarketPage({
  watchlist = [],
  toggleWatchlist = () => {},
}) {
  const [stocks, setStocks] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [noData, setNoData] = useState(false);

  // har stock ki rolling price history { AAPL: [..], ... }
  const [history, setHistory] = useState({});

  // chart/basic preference (yaad rakhti hai)
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem("marketView") || "chart";
    } catch {
      return "chart";
    }
  });

  const changeView = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("marketView", mode);
    } catch {}
  };

  const loadStocks = () => {
    setIsLoading(true);
    getStocks()
      .then((result) => {
        setStocks(result.stocks);
        setIsStale(result.isStale);
        setFetchedAt(result.fetchedAt);
        setNoData(result.noData);
      })
      .catch((error) => console.error("STOCK ERROR:", error))
      .finally(() => setIsLoading(false));
  };

  // Initial load
  useEffect(() => {
    loadStocks();
  }, []);

  // Hidden demo shortcut: Ctrl+Shift+X
  useEffect(() => {
    const handleShortcut = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "X") {
        simulateFetchFailure();
        loadStocks();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  // stocks badle to history mein naya point jodo
  useEffect(() => {
    if (!stocks.length) return;
    setHistory((prev) => {
      const next = { ...prev };
      stocks.forEach((s) => {
        if (s.price == null) return;
        if (!next[s.symbol]) {
          next[s.symbol] = seedSeries(s); // pehli baar: starting shape
        } else {
          next[s.symbol] = [...next[s.symbol], s.price].slice(-MAX_POINTS);
        }
      });
      return next;
    });
  }, [stocks]);

  // har 30 sec mein fresh data (polling)
  useEffect(() => {
    if (isLoading || noData) return;
    let cancelled = false;

    const id = setInterval(async () => {
      if (document.hidden) return; // tab background mein ho to skip
      const result = await refreshStocks();
      if (cancelled || !result) return;
      setStocks(result.stocks);
      setIsStale(false);
      setFetchedAt(result.fetchedAt);
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [isLoading, noData]);

  const handleSectorChange = (sector) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  let filteredStocks = stocks.filter((stock) => {
    const sectorMatch =
      selectedSectors.length === 0 || selectedSectors.includes(stock.sector);
    const priceMatch = stock.price <= maxPrice;
    return sectorMatch && priceMatch;
  });

  if (sortBy === "gainers") {
    filteredStocks.sort((a, b) => b.change - a.change);
  } else if (sortBy === "losers") {
    filteredStocks.sort((a, b) => a.change - b.change);
  }

  return (
    <div className="market-page">
      <div className="market-header">
        <h1>Market</h1>
      </div>

      {isStale && (
        <div className="stale-badge">
          ⚠️ Showing last known prices · updated{" "}
          {fetchedAt ? Math.round((Date.now() - fetchedAt) / 1000) : "—"}s ago
        </div>
      )}

      {noData && (
        <div className="no-data-message">
          Couldn't load stock prices right now, and no cached data was available.
        </div>
      )}

      {!noData && <GainersLosersWidget quotes={stocks} />}

      <div className="market-body">
        <aside className="filter-sidebar">
          <div className="filter-group">
            <p className="filter-title">Sector</p>
            {SECTOR_OPTIONS.map((sector) => (
              <label key={sector}>
                <input
                  type="checkbox"
                  checked={selectedSectors.includes(sector)}
                  onChange={() => handleSectorChange(sector)}
                />
                {sector}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <p className="filter-title">Price range</p>
            <input
              type="range"
              min="0"
              max="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <p>Up to ${maxPrice}</p>
          </div>

          <div className="filter-group">
            <p className="filter-title">Sort by</p>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">Default</option>
              <option value="gainers">Top gainers</option>
              <option value="losers">Top losers</option>
            </select>
          </div>
        </aside>

        {!noData && (
          <div className="stock-area">
            <div className="view-toolbar">
              <span className="view-count">
                <i className="live-dot" /> Live · {filteredStocks.length} stocks · updates every 30s
              </span>

              <div className="view-toggle" role="group" aria-label="Card view">
                <button
                  className={viewMode === "chart" ? "view-btn active" : "view-btn"}
                  onClick={() => changeView("chart")}
                  aria-pressed={viewMode === "chart"}
                >
                  📈 Chart
                </button>
                <button
                  className={viewMode === "basic" ? "view-btn active" : "view-btn"}
                  onClick={() => changeView("basic")}
                  aria-pressed={viewMode === "basic"}
                >
                  ☰ Basic
                </button>
              </div>
            </div>

            <div className="stock-grid">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                : filteredStocks.map((stock, i) => (
                    <Link
                      key={stock.symbol}
                      to={`/stock/${stock.symbol}`}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        animationDelay: `${i * 40}ms`,
                      }}
                    >
                      <StockCard
                        symbol={stock.symbol}
                        company={stock.name}
                        price={stock.price}
                        currency="$"
                        change={stock.change}
                        hp={stock.highprice}
                        lp={stock.lowprice}
                        op={stock.openprice}
                        view={viewMode}
                        history={history[stock.symbol] || []}
                        isWatchlisted={watchlist.includes(stock.symbol)}
                        onWatchlistClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          toggleWatchlist(stock.symbol);
                        }}
                      />
                    </Link>
                  ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
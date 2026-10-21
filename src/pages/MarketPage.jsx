import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StockCard from "../components/StockCard";
import GainersLosersWidget from "../components/GainersLosersWidget";
import SkeletonCard from "../components/SkeletonCard";
import { getStocks, refreshStocks, simulateFetchFailure } from "../data/stocks"; // NEW: refreshStocks
import { seedSeries } from "../utils/sparkline"; // NEW
import "./MarketPage.css";

const POLL_MS = 30000; // NEW: 30 sec
const MAX_POINTS = 40; // NEW: chart mein kitne points

export default function MarketPage({
  watchlist = [],
  toggleWatchlist = () => {},
}) {
  const [market, setMarket] = useState("us");
  const [stocks, setStocks] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [noData, setNoData] = useState(false);

  // NEW: chart/basic preference (yaad rakhti hai)
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem("marketView") || "chart";
    } catch {
      return "chart";
    }
  });

  // NEW: har stock ki rolling price history { AAPL: [..], ... }
  const [history, setHistory] = useState({});

  const changeView = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("marketView", mode);
    } catch {}
  };

  const loadStocks = (selectedMarket) => {
    setIsLoading(true);
    getStocks(selectedMarket)
      .then((result) => {
        setStocks(result.stocks);
        setIsStale(result.isStale);
        setFetchedAt(result.fetchedAt);
        setNoData(result.noData);
      })
      .catch((error) => console.error("STOCK ERROR:", error))
      .finally(() => setIsLoading(false));
  };

  const handleMarketSwitch = (newMarket) => {
    setMarket(newMarket);
    setSelectedSectors([]);
    setMaxPrice(newMarket === "in" ? 5000 : 1000);
  };

  // Initial load + market switch
  useEffect(() => {
    loadStocks(market);
  }, [market]);

  // Hidden demo shortcut: Ctrl+Shift+X
  useEffect(() => {
    const handleShortcut = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "X") {
        simulateFetchFailure();
        loadStocks(market);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [market]);

  // NEW: stocks badle to history mein naya point jodo
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

  // NEW: har 30 sec mein fresh data (polling)
  useEffect(() => {
    if (isLoading || noData) return;
    let cancelled = false;

    const id = setInterval(async () => {
      if (document.hidden) return; // tab background mein ho to skip
      const result = await refreshStocks(market);
      if (cancelled || !result) return;
      setStocks(result.stocks);
      setIsStale(false);
      setFetchedAt(result.fetchedAt);
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [market, isLoading, noData]);

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

  const sectorOptions =
    market === "in"
      ? ["IT", "Banking", "FMCG", "Energy", "Auto", "Pharma", "Infrastructure", "Telecom"]
      : ["IT", "Banking", "Energy", "Auto"];

  const currencySymbol = market === "in" ? "₹" : "$";

  return (
    <div className="market-page">
      <div className="market-header">
        <h1>Market</h1>
      </div>

      <div className="market-tabs">
        <button
          className={market === "us" ? "market-tab active" : "market-tab"}
          onClick={() => handleMarketSwitch("us")}
        >
          🇺🇸 US Markets
        </button>
        <button
          className={market === "in" ? "market-tab active" : "market-tab"}
          onClick={() => handleMarketSwitch("in")}
        >
          🇮🇳 Indian Markets
        </button>
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
            {sectorOptions.map((sector) => (
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
              max={market === "in" ? "5000" : "1000"}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <p>
              Up to {currencySymbol}
              {maxPrice}
            </p>
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
            {/* NEW: toolbar with live indicator + Chart/Basic toggle */}
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

            <div className={`stock-grid ${viewMode}`}>
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
                        currency={currencySymbol}
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
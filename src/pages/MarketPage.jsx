import StockCard from "./StockCard";
import { stocks } from "./MockStocks";

export default function MarketPage({ watchlist, toggleWatchlist }) {
  return (
    <div className="market-page">
      {/* Header */}
      <div className="market-header">
        <h1>Market</h1>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search stocks" disabled />
        </div>
      </div>

      <div className="market-body">
        {/* Filter */}
        <aside className="filter-sidebar">
          <div className="filter-group">
            <p className="filter-title">Sector</p>
            <label><input type="checkbox" disabled /> IT</label>
            <label><input type="checkbox" disabled /> Banking</label>
            <label><input type="checkbox" disabled /> Energy</label>
            <label><input type="checkbox" disabled /> Auto</label>
          </div>

          <div className="filter-group">
            <p className="filter-title">Price range</p>
            <input type="range" disabled />
          </div>

          <div className="filter-group">
            <p className="filter-title">Sort by</p>
            <select disabled>
              <option>Top gainers</option>
              <option>Top losers</option>
            </select>
          </div>
        </aside>

        {/* Stock grid */}
        <div className="stock-grid">
          {stocks.map((stock) => (
            <StockCard
              key={stock.symbol}
              symbol={stock.symbol}
              company={stock.name}
              price={stock.price}
              change={stock.change}
              isWatchlisted={watchlist.includes(stock.symbol)}
              onWatchlistClick={() => toggleWatchlist(stock.symbol)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
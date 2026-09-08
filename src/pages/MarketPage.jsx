import { useEffect, useState } from "react";
import StockCard from "../components/StockCard";
import { getStocks } from "../data/stocks";
import "./MarketPage.css";

export default function MarketPage({
  watchlist = [],
  toggleWatchlist = () => {}
}) {

  const [stocks, setStocks] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [maxPrice, setMaxPrice] = useState(1000);


//   useEffect(() => {
//     getStocks().then((data) => {
//       setStocks(data);
//     });
//   }, []);
  useEffect(() => {
  getStocks()
    .then((data) => {
      console.log("STOCK DATA:", data);
      setStocks(data);
    })
    .catch((error) => {
      console.error("STOCK ERROR:", error);
    });
}, []);


  // Sector checkbox
  const handleSectorChange = (sector) => {
    setSelectedSectors((prev) => {
      if (prev.includes(sector)) {
        return prev.filter((item) => item !== sector);
      }
      return [...prev, sector];

    });
  };


  // Filter stocks
  let filteredStocks = stocks.filter((stock) => {

    const sectorMatch =
      selectedSectors.length === 0 ||
      selectedSectors.includes(stock.sector);

    const priceMatch =
      stock.price <= maxPrice;

    return sectorMatch && priceMatch;

  });


  // Sorting
  if (sortBy === "gainers") {
    filteredStocks.sort((a, b) => b.change - a.change);
  } 
  else if (sortBy === "losers") {
    filteredStocks.sort((a, b) => a.change - b.change);
  }

  return (
    <div className="market-page">
      {/* Header */}
     <div className="market-header">
        <h1>Market</h1>
      </div>


      <div className="market-body">

        {/* Filter Sidebar */}
        <aside className="filter-sidebar">

          <div className="filter-group">

            <p className="filter-title">
              Sector
            </p>

            <label>
              <input
                type="checkbox"
                checked={selectedSectors.includes("IT")}
                onChange={() => handleSectorChange("IT")}
              />
              IT
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedSectors.includes("Banking")}
                onChange={() => handleSectorChange("Banking")}
              />
              Banking
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedSectors.includes("Energy")}
                onChange={() => handleSectorChange("Energy")}
              />
              Energy
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedSectors.includes("Auto")}
                onChange={() => handleSectorChange("Auto")}
              />
              Auto
            </label>

          </div>


          {/* Price Range */}

          <div className="filter-group">

            <p className="filter-title">
              Price range
            </p>

            <input
              type="range"
              min="0"
              max="1000"
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(Number(e.target.value))
              }
            />

            <p>
              Up to ${maxPrice}
            </p>

          </div>


          {/* Sort */}

          <div className="filter-group">

            <p className="filter-title">
              Sort by
            </p>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
            >

              <option value="default">
                Default
              </option>

              <option value="gainers">
                Top gainers
              </option>

              <option value="losers">
                Top losers
              </option>

            </select>

          </div>

        </aside>


        {/* Stock Grid */}

        <div className="stock-grid">

          {filteredStocks.map((stock) => (

            <StockCard
              key={stock.symbol}
              symbol={stock.symbol}
              company={stock.name}
              price={stock.price}
              change={stock.change}
              hp={stock.highprice}
              lp={stock.lowprice}
              op={stock.openprice}
              isWatchlisted={watchlist.includes(stock.symbol)}
              onWatchlistClick={() =>
                toggleWatchlist(stock.symbol)
              }
            />

          ))}

        </div>

      </div>

    </div>
  );
}
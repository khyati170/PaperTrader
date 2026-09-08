// import Navbar from "./components/navbar";
// import Home from "./pages/Home";
// import "./index.css";

// function App() {
//   return (
//     <>
//       <Navbar />
//       <Home />
//     </>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Home from "./Home";
import MarketPage from "./MarketPage";
import WatchlistPage from "./WatchlistPage";
import StockDetail from "./StockDetail";
import { stocks } from "./stocks";

function App() {
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem("watchlist");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (symbol) => {
    setWatchlist((prev) => [...prev, symbol]);
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
  };

  const toggleWatchlist = (symbol) => {
    if (watchlist.includes(symbol)) {
      removeFromWatchlist(symbol);
    } else {
      addToWatchlist(symbol);
    }
  };

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/market"
          element={
            <MarketPage
              stocks={stocks}
              watchlist={watchlist}
              toggleWatchlist={toggleWatchlist}
            />
          }
        />
        <Route
          path="/watchlist"
          element={<WatchlistPage watchlist={watchlist} stocks={stocks} toggleWatchlist={toggleWatchlist} />}
        />
        <Route path="/stock/:symbol" element={<StockDetail stocks={stocks} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
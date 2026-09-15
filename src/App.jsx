import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/navbar";
import Home from "./pages/Home"
import MarketPage from "./pages/MarketPage";
import WatchList from "./pages/WatchList";
import StockDetail from "./StockDetail.jsx";
import Login from "./pages/Login.jsx";

function App() {
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem("watchlist");
    return saved ? JSON.parse(saved) : [];
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem("balance");
    return saved ? Number(saved) : 0;
  });

  const [holdings, setHoldings] = useState(() => {
    const saved = localStorage.getItem("holdings");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem("balance", balance);
  }, [balance]);

  useEffect(() => {
    localStorage.setItem("holdings", JSON.stringify(holdings));
  }, [holdings]);

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

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setBalance(userData.balance);
  };

  // Centralized buy/sell so ANY page (StockDetail, later Portfolio) uses the same logic
  const handleBuy = (symbol, price, quantity) => {
    const cost = price * quantity;
    if (cost > balance) {
      alert("Insufficient balance");
      return;
    }
    setBalance((prev) => prev - cost);
    setHoldings((prev) => ({
      ...prev,
      [symbol]: (prev[symbol] || 0) + quantity,
    }));
  };

  const handleSell = (symbol, price, quantity) => {
    const currentlyOwned = holdings[symbol] || 0;
    if (quantity > currentlyOwned) {
      alert("You don't own that many shares");
      return;
    }
    setBalance((prev) => prev + price * quantity);
    setHoldings((prev) => ({
      ...prev,
      [symbol]: prev[symbol] - quantity,
    }));
  };

  return (
    <BrowserRouter>
      <Navbar isAuthenticated={isAuthenticated} balance={balance} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/market"
          element={<MarketPage watchlist={watchlist} toggleWatchlist={toggleWatchlist} />}
        />
        <Route
          path="/watchlist"
          element={<WatchList watchlist={watchlist} toggleWatchlist={toggleWatchlist} />}
        />
        <Route
          path="/stock/:symbol"
          element={
            <StockDetail
              balance={balance}
              holdings={holdings}
              onBuy={handleBuy}
              onSell={handleSell}
            />
          }
        />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
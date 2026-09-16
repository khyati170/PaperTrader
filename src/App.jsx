import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/navbar";
import Home from "./pages/Home";
import MarketPage from "./pages/MarketPage";
import WatchList from "./pages/WatchList";
import StockDetail from "./StockDetail.jsx";
import Login from "./pages/Login.jsx";
import Portfolio from "./pages/Portfolio.jsx";

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

<<<<<<< HEAD
  // Centralized buy/sell so ANY page (StockDetail, later Portfolio) uses the same logic
  
    const handleBuy = (symbol, price, quantity) => {
    if (!price || price <= 0) {
      alert("Price unavailable right now, try again in a moment.");
      return;
    }
=======
  const handleBuy = (symbol, price, quantity) => {
>>>>>>> 1ef4e184a68b9009649e8ab717e33132e49507b7
    const cost = price * quantity;
    if (cost > balance) {
      alert("Insufficient balance");
      return;
    }

    setBalance((prev) => prev - cost);

    setHoldings((prev) => {
      const existing = prev[symbol];

      if (!existing) {
        return {
          ...prev,
          [symbol]: { quantity, avgBuyPrice: price },
        };
      }

      const totalCost = existing.avgBuyPrice * existing.quantity + price * quantity;
      const totalQuantity = existing.quantity + quantity;
      const newAvgBuyPrice = totalCost / totalQuantity;

      return {
        ...prev,
        [symbol]: { quantity: totalQuantity, avgBuyPrice: newAvgBuyPrice },
      };
    });
  };

  const handleSell = (symbol, price, quantity) => {
    const existing = holdings[symbol];
    const currentlyOwned = existing?.quantity || 0;

    if (quantity > currentlyOwned) {
      alert("You don't own that many shares");
      return;
    }

    setBalance((prev) => prev + price * quantity);

    setHoldings((prev) => {
      const remaining = existing.quantity - quantity;

      if (remaining === 0) {
        const updated = { ...prev };
        delete updated[symbol];
        return updated;
      }

      return {
        ...prev,
        [symbol]: { quantity: remaining, avgBuyPrice: existing.avgBuyPrice },
      };
    });
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
        <Route
  path="/portfolio"
  element={<Portfolio balance={balance} holdings={holdings} />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
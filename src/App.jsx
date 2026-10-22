import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  isMarketOpen,
  getMarketStatusMessage,
} from "./config/marketConfig.js";

import Navbar from "./components/navbar";
import Home from "./pages/Home";
import MarketPage from "./pages/MarketPage";
import WatchList from "./pages/WatchList";
import StockDetail from "./StockDetail.jsx";
import Login from "./pages/Login.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import Lessons from "./pages/lessons.jsx";
import TickerTape from "./components/TickerTape";

function App() {
  const [watchlist, setWatchlist] = useState([]);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [balance, setBalance] = useState(0);
  
  const [holdings, setHoldings] = useState({});

 const toggleWatchlist = (symbol) => {
  if (!isAuthenticated) {
    alert("Please login or use Demo Account to use the watchlist.");
    return;
  }

  setWatchlist((prev) => {
    if (prev.includes(symbol)) {
      return prev.filter((s) => s !== symbol);
    }

    return [...prev, symbol];
  });
};


  // LOGIN
  const handleLogin = (userData) => {
  setIsAuthenticated(true);

  setBalance(userData.balance ?? 50000);

  const formattedHoldings = {};

  if (userData.holdings && userData.holdings.length > 0) {
    userData.holdings.forEach((stock) => {
      formattedHoldings[stock.symbol] = {
        quantity: stock.quantity,
        avgBuyPrice: stock.buyPrice,
        buyDate: stock.buyDate,
        name: stock.name,
      };
    });
  }

  setHoldings(formattedHoldings);

  localStorage.setItem(
    "accountType",
    userData.isDemo ? "demo" : "normal"
  );
};

  const handleLogout = () => {
  setIsAuthenticated(false);
  setBalance(0);
  setHoldings({});
  setWatchlist([]);
  localStorage.removeItem("accountType");
};
  // BUY
  const handleBuy = (symbol, price, quantity) => {
    if (!isAuthenticated) {
      alert("Please login or use Demo Account to buy stocks.");
      return false;
    }
    if (!isMarketOpen()) {
      alert(getMarketStatusMessage());
      return false;
    }

    if (!price || price <= 0) {
      alert("Price unavailable right now, try again in a moment.");
      return false;
    }

    const cost = price * quantity;

    if (cost > balance) {
      alert("Insufficient balance");
      return false;
    }

    setBalance((prev) => prev - cost);

    setHoldings((prev) => {
      const existing = prev[symbol];

      if (!existing) {
        return {
          ...prev,
          [symbol]: {
            quantity,
            avgBuyPrice: price,
            buyDate: new Date().toISOString().split("T")[0],
          },
        };
      }

      const existingQty = Number(existing.quantity) || 0;
      const existingAvgPrice = Number(existing.avgBuyPrice) || 0;

      const totalCost =
        existingAvgPrice * existingQty + price * quantity;

      const totalQuantity = existingQty + quantity;

      const newAvgBuyPrice =
        totalQuantity > 0 ? totalCost / totalQuantity : 0;

      return {
        ...prev,
        [symbol]: {
          ...existing,
          quantity: totalQuantity,
          avgBuyPrice: newAvgBuyPrice,
        },
      };
    });
    return true;
  };

  // SELL
  const handleSell = (symbol, price, quantity) => {
    if (!isAuthenticated) {
      alert("Please login or use Demo Account to buy stocks.");
      return false;
    }
    if (!isMarketOpen()) {
      alert(getMarketStatusMessage());
      return false;
    }

    if (!price || price <= 0) {
      alert("Price unavailable right now, try again in a moment.");
      return false;
    }

    const existing = holdings[symbol];
    const currentlyOwned = Number(existing?.quantity) || 0;

    if (quantity > currentlyOwned) {
      alert("You don't own that many shares");
      return false;
    }

    setBalance((prev) => prev + price * quantity);

    setHoldings((prev) => {
      const remaining = currentlyOwned - quantity;

      if (remaining === 0) {
        const updated = { ...prev };
        delete updated[symbol];
        return updated;
      }

      return {
        ...prev,
        [symbol]: {
          ...existing,
          quantity: remaining,
          avgBuyPrice: Number(existing.avgBuyPrice) || 0,
        },
      };
    });
    return true;
  };

  return (
    <BrowserRouter>
      <Navbar
        isAuthenticated={isAuthenticated}
        balance={balance}
        onLogout={handleLogout}
      />
    <TickerTape/>

      <Routes>
        <Route
          path="/market"
          element={
            <MarketPage
              watchlist={watchlist}
              toggleWatchlist={toggleWatchlist}
            />
          }
        />
      
      <Route
  path="/watchlist"
  element={
    isAuthenticated ? (
      <WatchList
        watchlist={watchlist}
        toggleWatchlist={toggleWatchlist}
      />
    ) : (
      <Login onLogin={handleLogin} />
    )
  }
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

        <Route
          path="/login"
          element={<Login onLogin={handleLogin} />}
        />

        <Route
  path="/portfolio"
  element={
    isAuthenticated ? (
      <Portfolio
        balance={balance}
        holdings={holdings}
        onSell={handleSell}
      />
    ) : (
      <Login onLogin={handleLogin} />
    )
  }
/>
        <Route
          path="/"
          element={
            <Home
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/lessons"
          element={<Lessons />}/>
     
      </Routes>
    </BrowserRouter>
  );
}

export default App;
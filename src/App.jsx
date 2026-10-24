import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";

import NewsPage from "./pages/NewsPage";



import { isMarketOpen, getMarketStatusMessage } from "./config/marketConfig.js";


import Navbar from "./components/navbar";
import Home from "./pages/Home";
import MarketPage from "./pages/MarketPage";
import WatchList from "./pages/WatchList";
import StockDetail from "./StockDetail.jsx";
import Login from "./pages/Login.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import Lessons from "./pages/lessons.jsx";
import TickerTape from "./components/TickerTape";

// ---------- Persistence helpers ----------
const SESSION_KEY = "paperTrader:session";
const dataKey = (email) => `paperTrader:data:${email}`;
const EMPTY_DATA = { balance: 0, holdings: {}, transactions: [], watchlist: [] };

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function readUserData(email) {
  try {
    const raw = localStorage.getItem(dataKey(email));
    return raw ? { ...EMPTY_DATA, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

// Runs once on page load: restores the logged-in user and their saved data
function loadInitial() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (session?.email) {
      const data = readUserData(session.email);
      if (data) return { user: session, data };
    }
  } catch {
    // ignore corrupted storage
  }
  return { user: null, data: EMPTY_DATA };
}

// Sends logged-out visitors to /login, then back to the page they wanted
function RequireAuth({ isAuthenticated, children }) {
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  const [initial] = useState(loadInitial);
  const [user, setUser] = useState(initial.user);
  const [balance, setBalance] = useState(initial.data.balance);
  const [holdings, setHoldings] = useState(initial.data.holdings);
  const [transactions, setTransactions] = useState(initial.data.transactions);
  const [watchlist, setWatchlist] = useState(initial.data.watchlist);

  const isAuthenticated = user !== null;

  // Save this user's data whenever anything changes (only while logged in)
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(
      dataKey(user.email),
      JSON.stringify({ balance, holdings, transactions, watchlist })
    );
  }, [user, balance, holdings, transactions, watchlist]);

  const toggleWatchlist = (symbol) => {
    if (!isAuthenticated) {
      alert("Please login or use Demo Account to use the watchlist.");
      return;
    }
    setWatchlist((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const addTransaction = (type, symbol, price, quantity) => {
    setTransactions((prev) => [
      {
        id: makeId(),
        type, // "BUY" or "SELL"
        symbol,
        quantity,
        price,
        total: price * quantity,
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // LOGIN
  const handleLogin = (userData) => {
    const saved = readUserData(userData.email);
    let data;

    if (saved) {
      // Returning user: load exactly what they had
      data = saved;
    } else {
      // First login ever for this account: seed from signup / demo data
      const formattedHoldings = {};
      (userData.holdings || []).forEach((stock) => {
        formattedHoldings[stock.symbol] = {
          quantity: stock.quantity,
          avgBuyPrice: stock.buyPrice,
          buyDate: stock.buyDate,
          name: stock.name,
        };
      });

      const seededTransactions = (userData.holdings || []).map((stock) => ({
        id: makeId(),
        type: "BUY",
        symbol: stock.symbol,
        quantity: stock.quantity,
        price: stock.buyPrice,
        total: stock.buyPrice * stock.quantity,
        date: stock.buyDate,
      }));

      data = {
        balance: userData.balance ?? 50000,
        holdings: formattedHoldings,
        transactions: seededTransactions,
        watchlist: [],
      };
    }

    const sessionUser = {
      name: userData.name,
      email: userData.email,
      isDemo: !!userData.isDemo,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    localStorage.setItem("accountType", userData.isDemo ? "demo" : "normal");

    setBalance(data.balance);
    setHoldings(data.holdings);
    setTransactions(data.transactions);
    setWatchlist(data.watchlist);
    setUser(sessionUser);
  };

  // LOGOUT: clears the screen state only. The saved data stays in localStorage.
  const handleLogout = () => {
    setUser(null);
    setBalance(0);
    setHoldings({});
    setTransactions([]);
    setWatchlist([]);
    localStorage.removeItem(SESSION_KEY);
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
      const totalCost = existingAvgPrice * existingQty + price * quantity;
      const totalQuantity = existingQty + quantity;
      const newAvgBuyPrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;

      return {
        ...prev,
        [symbol]: {
          ...existing,
          quantity: totalQuantity,
          avgBuyPrice: newAvgBuyPrice,
        },
      };
    });

    addTransaction("BUY", symbol, price, quantity);
    return true;
  };

  // SELL
  const handleSell = (symbol, price, quantity) => {
    if (!isAuthenticated) {
      alert("Please login or use Demo Account to sell stocks.");
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

    addTransaction("SELL", symbol, price, quantity);
    return true;
  };

  return (
    <BrowserRouter>
      <Navbar
        isAuthenticated={isAuthenticated}
        balance={balance}
        onLogout={handleLogout}
      />
      <TickerTape />

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
            <RequireAuth isAuthenticated={isAuthenticated}>
              <StockDetail
                balance={balance}
                holdings={holdings}
                onBuy={handleBuy}
                onSell={handleSell}
              />
            </RequireAuth>
          }
        />

        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        <Route
          path="/portfolio"
          element={
            <RequireAuth isAuthenticated={isAuthenticated}>
              <Portfolio
                balance={balance}
                holdings={holdings}
                transactions={transactions}
                onSell={handleSell}
              />
            </RequireAuth>
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

          <Route
  path="/news"
  element={<NewsPage holdings={holdings} />}
/>
     


       

      </Routes>
    </BrowserRouter>
  );
}

export default App;
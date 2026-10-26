import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadUserData,
  saveUserData,
  logout,
  toggleWatchlist as toggleWatchlistAction,
  applyBuy,
  applySell,
} from "./store/userSlice";

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

function RequireAuth({ isAuthenticated, children }) {
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function LoginRoute({ isAuthenticated, onLogin }) {
  const location = useLocation();

  if (isAuthenticated) {
    const from = location.state?.from?.pathname;
    const target = from && from !== "/login" ? from : "/market";
    return <Navigate to={target} replace />;
  }

  return <Login onLogin={onLogin} />;
}

function App() {
  const dispatch = useDispatch();
  const { user, balance, holdings, transactions, watchlist, status } =
    useSelector((s) => s.user);

  const isAuthenticated = user !== null;

  // Refresh par: session mila hai toh server se uska data lao
  useEffect(() => {
    if (user) dispatch(loadUserData(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Data badle toh json-server mein save (load hone se pehle nahi)
 useEffect(() => {
  if (!user || status !== "ready") return;

  dispatch(saveUserData());
}, [user, balance, holdings, transactions, watchlist, status, dispatch]);
  const toggleWatchlist = (symbol) => {
    if (!isAuthenticated) {
      alert("Please login or use Demo Account to use the watchlist.");
      return;
    }
    dispatch(toggleWatchlistAction(symbol));
  };

  // LOGIN
  const handleLogin = (userData) => {
    dispatch(loadUserData(userData));
  };

  // LOGOUT
  const handleLogout = () => {
    dispatch(logout());
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

    dispatch(applyBuy(symbol, price, quantity));
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

    const currentlyOwned = Number(holdings[symbol]?.quantity) || 0;

    if (quantity > currentlyOwned) {
      alert("You don't own that many shares");
      return false;
    }

    dispatch(applySell(symbol, price, quantity));
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

      {status === "error" && (
        <div
          style={{
            background: "#fdecea",
            color: "#a5432d",
            padding: "8px 16px",
            textAlign: "center",
          }}
        >
          Some features may be temporarily unavailable.
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={<Home isAuthenticated={isAuthenticated} />}
        />

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
                watchlist={watchlist}
                toggleWatchlist={toggleWatchlist}
              />
            </RequireAuth>
          }
        />

        <Route
          path="/login"
          element={
            <LoginRoute
              isAuthenticated={isAuthenticated}
              onLogin={handleLogin}
            />
          }
        />

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

        <Route path="/lessons" element={<Lessons />} />

        <Route path="/news" element={<NewsPage holdings={holdings} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { isMarketOpen,getMarketStatusMessage } from "./config/marketConfig.js";
// import Navbar from "./components/navbar";

// import Home from "./pages/Home";
// import MarketPage from "./pages/MarketPage";
// import WatchList from "./pages/WatchList";
// import StockDetail from "./StockDetail.jsx";
// import Login from "./pages/Login.jsx";
// import Portfolio from "./pages/Portfolio.jsx";

// function App() {
//   const [watchlist, setWatchlist] = useState(() => {
//     const saved = localStorage.getItem("watchlist");
//     return saved ? JSON.parse(saved) : [];
//   });

//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   const [balance, setBalance] = useState(() => {
//     const saved = localStorage.getItem("balance");
//     return saved ? Number(saved) : 0;
//   });

//   const [holdings, setHoldings] = useState(() => {
//     const saved = localStorage.getItem("holdings");
//     return saved ? JSON.parse(saved) : {};
//   });

//   useEffect(() => {
//     localStorage.setItem("watchlist", JSON.stringify(watchlist));
//   }, [watchlist]);

//   useEffect(() => {
//     localStorage.setItem("balance", balance);
//   }, [balance]);

//   useEffect(() => {
//     localStorage.setItem("holdings", JSON.stringify(holdings));
//   }, [holdings]);

//   const addToWatchlist = (symbol) => {
//     setWatchlist((prev) => [...prev, symbol]);
//   };

//   const removeFromWatchlist = (symbol) => {
//     setWatchlist((prev) => prev.filter((s) => s !== symbol));
//   };

//   const toggleWatchlist = (symbol) => {
//     if (watchlist.includes(symbol)) {
//       removeFromWatchlist(symbol);
//     } else {
//       addToWatchlist(symbol);
//     }
//   };

//   const handleLogin = (userData) => {
//     setIsAuthenticated(true);
//     setBalance(userData.balance);
//   };

//   const handleBuy = (symbol, price, quantity) => {
//     if(!isMarketOpen()){
//       alert(getMarketStatusMessage());
//       return;
//     }
//     if (!price || price <= 0) {
//       alert("Price unavailable right now, try again in a moment.");
//       return;
//     }

//     const cost = price * quantity;

//     if (cost > balance) {
//       alert("Insufficient balance");
//       return;
//     }

//     setBalance((prev) => prev - cost);

//     setHoldings((prev) => {
//       const existing = prev[symbol];

//       if (!existing) {
//         return {
//           ...prev,
//           [symbol]: {
//             quantity,
//             avgBuyPrice: price,
//           },
//         };
//       }

      
//       const existingQty = Number(existing.quantity) || 0;
//       const existingAvgPrice = Number(existing.avgBuyPrice) || 0;

//       const totalCost = existingAvgPrice * existingQty + price * quantity;
//       const totalQuantity = existingQty + quantity;
//       const newAvgBuyPrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;

//       return {
//         ...prev,
//         [symbol]: {
//           quantity: totalQuantity,
//           avgBuyPrice: newAvgBuyPrice,
//         },
//       };
//     });
//   };

//   const handleSell = (symbol, price, quantity) => {
//     if(!isMarketOpen()){
//       alert(getMarketStatusMessage());
//       return;
//     }
//     if (!price || price <= 0) {
//       alert("Price unavailable right now, try again in a moment.");
//       return;
//     }

//     const existing = holdings[symbol];
//     const currentlyOwned = Number(existing?.quantity) || 0;

//     if (quantity > currentlyOwned) {
//       alert("You don't own that many shares");
//       return;
//     }

//     setBalance((prev) => prev + price * quantity);

//     setHoldings((prev) => {
//       const remaining = currentlyOwned - quantity;

//       if (remaining === 0) {
//         const updated = { ...prev };
//         delete updated[symbol];
//         return updated;
//       }

//       return {
//         ...prev,
//         [symbol]: {
//           quantity: remaining,
//           avgBuyPrice: Number(existing.avgBuyPrice) || 0,
//         },
//       };
//     });
//   };

//   return (
//     <BrowserRouter>
//       <Navbar
//         isAuthenticated={isAuthenticated}
//         balance={balance}
//       />

//       <Routes>
//         <Route
//           path="/"
//           element={<Home />}
//         />

//         <Route
//           path="/market"
//           element={
//             <MarketPage
//               watchlist={watchlist}
//               toggleWatchlist={toggleWatchlist}
//             />
//           }
//         />

//         <Route
//           path="/watchlist"
//           element={
//             <WatchList
//               watchlist={watchlist}
//               toggleWatchlist={toggleWatchlist}
//             />
//           }
//         />

//         <Route
//           path="/stock/:symbol"
//           element={
//             <StockDetail
//               balance={balance}
//               holdings={holdings}
//               onBuy={handleBuy}
//               onSell={handleSell}
//             />
//           }
//         />

//         <Route
//           path="/login"
//           element={<Login onLogin={handleLogin} />}
//         />

//         <Route
//           path="/portfolio"
//           element={
//             <Portfolio
//               balance={balance}
//               holdings={holdings}
//               onSell={handleSell}
//             />
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


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

  // LOGIN
  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setBalance(userData.balance ?? 50000);

    // Convert demo holdings array into the format
    // already used by your Buy/Sell system.
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

    // Store which type of account is currently logged in
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
    if (!isMarketOpen()) {
      alert(getMarketStatusMessage());
      return;
    }

    if (!price || price <= 0) {
      alert("Price unavailable right now, try again in a moment.");
      return;
    }

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
  };

  // SELL
  const handleSell = (symbol, price, quantity) => {
    if (!isMarketOpen()) {
      alert(getMarketStatusMessage());
      return;
    }

    if (!price || price <= 0) {
      alert("Price unavailable right now, try again in a moment.");
      return;
    }

    const existing = holdings[symbol];
    const currentlyOwned = Number(existing?.quantity) || 0;

    if (quantity > currentlyOwned) {
      alert("You don't own that many shares");
      return;
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
  };

  return (
    <BrowserRouter>
      <Navbar
        isAuthenticated={isAuthenticated}
        balance={balance}
        onLogout={handleLogout}
      />

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
            <WatchList
              watchlist={watchlist}
              toggleWatchlist={toggleWatchlist}
            />
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
            <Portfolio
              balance={balance}
              holdings={holdings}
              onSell={handleSell}
            />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
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
import Navbar from "./components/navbar";
import Home from "./pages/Home"
import MarketPage from "./pages/MarketPage";
import { getStocks } from "./data/stocks";

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
            watchlist={watchlist}
            toggleWatchlist={toggleWatchlist}
         />
        }
    />
       
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { useEffect, useState } from "react";
import { getStocks } from "../data/stocks";
import "./TickerTape.css";

export default function TickerTape() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    getStocks("us").then((r) => setStocks(r.stocks || []));
  }, []);

  if (stocks.length === 0) return null;

  const items = stocks.map((s) => {
    const up = s.change >= 0;
    return (
      <span className="ticker-item" key={s.symbol}>
        <b>{s.symbol}</b>
        <span>${s.price?.toFixed(2)}</span>
        <span className={up ? "t-up" : "t-down"}>
          {up ? "▲" : "▼"} {Math.abs(s.change).toFixed(2)}%
        </span>
      </span>
    );
  });

  return (
    <div className="ticker-tape" aria-hidden="true">
      <div className="ticker-track">
        {items}
        {items}
      </div>
    </div>
  );
}
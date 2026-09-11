import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getStocks } from "./data/stocks.js";
import BuySellForm from "./components/BuySellForm.jsx";
import "./stockDetail.css";

function StockDetail() {
    const { symbol } = useParams();

    const [stock, setStock] = useState(null);
    const [loading, setLoading] = useState(true);

    const [balance, setBalance] = useState(50000);
    const [ownedShares, setOwnedShares] = useState(0);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        getStocks().then((allStocks) => {
            if (!isMounted) return;
            const found = allStocks.find((s) => s.symbol === symbol);
            setStock(found || null);
            setLoading(false);
        });

        return () => { isMounted = false; };
    }, [symbol]);

    const handleBuy = (stockArg, quantity) => {
        const cost = stockArg.price * quantity;
        if (cost > balance) {
            alert("Insufficient balance");
            return;
        }
        setBalance((prev) => prev - cost);
        setOwnedShares((prev) => prev + quantity);
    };

    const handleSell = (stockArg, quantity) => {
        if (quantity > ownedShares) {
            alert("You don't own that many shares");
            return;
        }
        setBalance((prev) => prev + stockArg.price * quantity);
        setOwnedShares((prev) => prev - quantity);
    };

    if (loading) {
        return <p className="loading-text">Loading {symbol}...</p>;
    }

    if (!stock) {
        return (
            <div className="stock-detail">
                <p className="loading-text">
                    Couldn't find "{symbol}". <Link to="/market">Back to Market</Link>
                </p>
            </div>
        );
    }

    return (
        <main className="stock-detail">
            <section className="stock-header">
                <div>
                    <p className="stock-symbol">{stock.symbol}</p>
                    <h1>{stock.symbol}</h1>
                    <div className="price-row">
                        <span className="stock-price">${stock.price?.toFixed(2)}</span>
                        <span className={stock.change >= 0 ? "positive-text" : "negative-text"}>
                            {stock.change >= 0 ? "+" : ""}
                            {stock.change?.toFixed(2)}%
                        </span>
                    </div>
                </div>
                <p className="balance-display">Balance: ${balance.toFixed(2)}</p>
            </section>

            <section className="fundamentals">
                <h2>Price Details</h2>
                <table>
                    <tbody>
                        <tr><td>Sector</td><td>{stock.sector}</td></tr>
                        <tr><td>High Price</td><td>${stock.highprice}</td></tr>
                        <tr><td>Low Price</td><td>${stock.lowprice}</td></tr>
                        <tr><td>Opening Price</td><td>${stock.openprice}</td></tr>
                    </tbody>
                </table>
            </section>

            <BuySellForm
                stock={{ symbol: stock.symbol, price: stock.price }}
                ownedShares={ownedShares}
                onBuy={handleBuy}
                onSell={handleSell}
            />
        </main>
    );
}

export default StockDetail;
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getStocks } from "./data/stocks.js";
import BuySellForm from "./components/BuySellForm.jsx";
import "./stockDetail.css";


function StockDetail({ balance, holdings, onBuy, onSell }) {
    const { symbol } = useParams();
    const navigate = useNavigate();

    const [stock, setStock] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [activeTab, setActiveTab] = useState("overview");
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(false);

        getStocks()
            .then((allStocks) => {
                if (!isMounted) return;
                setStock(allStocks.stocks.find((s) => s.symbol === symbol) || null);
                setLoading(false);
            })
            .catch(() => {
                if (!isMounted) return;
                setError(true);
                setLoading(false);
            });

        return () => { isMounted = false; };
    }, [symbol]);

    // Is stock ke kitne shares user ke paas hain
    const ownedShares = holdings[symbol]?.quantity || 0;

    const finishTrade = (message) => {
        setSuccessMessage(message);
        setShowSuccess(true);
        setTimeout(() => navigate("/portfolio"), 3500);
    };

    const handleBuy = (stockArg, quantity) => {
        // App.jsx ka handleBuy true (trade hua) ya false (reject hua) return karta hai
        const success = onBuy(stockArg.symbol, stockArg.price, quantity);
        if (!success) return;   // reject hua: na success message, na redirect

        finishTrade("You've successfully bought the shares.");
    };

    const handleSell = (stockArg, quantity) => {
        const success = onSell(stockArg.symbol, stockArg.price, quantity);
        if (!success) return;

        finishTrade("You've successfully sold the shares.");
    };

    if (loading) return <p className="loading-text">Loading {symbol}...</p>;

    if (error) {
        return (
            <div className="stock-detail">
                <p className="loading-text">
                    Couldn't load stock data. <Link to="/market">Back to Market</Link>
                </p>
            </div>
        );
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

    // Price History tab ke liye calculations
    const dayChange = stock.price - stock.previousclose;
    const rangeSpan = stock.highprice - stock.lowprice;
    const rangePercent = rangeSpan > 0
        ? Math.min(100, Math.max(0, ((stock.price - stock.lowprice) / rangeSpan) * 100))
        : 50;

    return (
        <main className="stock-detail">
            {showSuccess && (
                <div className="success-overlay">
                    <div className="success-box">
                        <span className="success-icon">✅</span>
                        <h2>Success!</h2>
                        <p>{successMessage}</p>
                        <p className="success-subtext">Redirecting to your portfolio...</p>
                    </div>
                </div>
            )}

            <section className="stock-header">
                <div>
                    <p className="stock-symbol">{stock.symbol}</p>
                    <h1>{stock.symbol}</h1>
                    <div className="price-row">
                        <span className="stock-price">${stock.price?.toFixed(2)}</span>
                        <span className={stock.change >= 0 ? "positive-text" : "negative-text"}>
                            {stock.change >= 0 ? "+" : ""}{stock.change?.toFixed(2)}%
                        </span>
                    </div>
                </div>
                <p className="balance-display">Balance: ${balance.toFixed(2)}</p>
            </section>

            <div className="detail-tabs">
                <button
                    className={`detail-tab ${activeTab === "overview" ? "active" : ""}`}
                    onClick={() => setActiveTab("overview")}
                >
                    Overview
                </button>
                <button
                    className={`detail-tab ${activeTab === "history" ? "active" : ""}`}
                    onClick={() => setActiveTab("history")}
                >
                    Price History
                </button>
            </div>

            {activeTab === "overview" && (
                <section className="fundamentals">
                    <h2>Price Details</h2>
                    <table>
                        <tbody>
                            <tr><td>Sector</td><td>{stock.sector}</td></tr>
                            <tr><td>High Price</td><td>${stock.highprice}</td></tr>
                            <tr><td>Low Price</td><td>${stock.lowprice}</td></tr>
                            <tr><td>Opening Price</td><td>${stock.openprice}</td></tr>
                            <tr><td>Previous Close</td><td>${stock.previousclose}</td></tr>
                        </tbody>
                    </table>
                </section>
            )}

            {activeTab === "history" && (
                <section className="fundamentals">
                    <h2>Today's Movement</h2>
                    <table>
                        <tbody>
                            <tr><td>Previous Close</td><td>${stock.previousclose}</td></tr>
                            <tr><td>Today's Open</td><td>${stock.openprice}</td></tr>
                            <tr><td>Current Price</td><td>${stock.price?.toFixed(2)}</td></tr>
                            <tr>
                                <td>Change vs Previous Close</td>
                                <td className={dayChange >= 0 ? "positive-text" : "negative-text"}>
                                    {dayChange >= 0 ? "+" : ""}${dayChange.toFixed(2)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <p className="range-title">Today's Range</p>
                    <div className="range-bar">
                        <div className="range-marker" style={{ left: `${rangePercent}%` }} />
                    </div>
                    <div className="range-labels">
                        <span>Low ${stock.lowprice}</span>
                        <span>High ${stock.highprice}</span>
                    </div>
                    
                </section>
            )}

            <BuySellForm
                stock={{ symbol: stock.symbol, price: stock.price }}
                ownedShares={ownedShares}
                balance={balance}
                onBuy={handleBuy}
                onSell={handleSell}
            />
        </main>
    );
}

export default StockDetail;
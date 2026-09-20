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

    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

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

    // How many shares of THIS specific stock the user owns
    const ownedShares = holdings[symbol]?.quantity || 0;

    const handleBuy = (stockArg, quantity) => {
        onBuy(stockArg.symbol, stockArg.price, quantity);
        setSuccessMessage("You've successfully bought the shares.");
        setShowSuccess(true);

        setTimeout(() => {
            navigate("/portfolio");
        }, 3500);
    };

    const handleSell = (stockArg, quantity) => {
        onSell(stockArg.symbol, stockArg.price, quantity);
        setSuccessMessage("You've successfully sold the shares.");
        setShowSuccess(true);

        setTimeout(() => {
            navigate("/portfolio");
        }, 3500);
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
                        <tr><td>Previous Close</td><td>${stock.previousclose}</td></tr>
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
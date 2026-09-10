
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchQuote, fetchOverview } from "../services/stocks.js";
import companies from "../data/stokes.js";
import BuySellForm from "../components/BuySellForm.jsx";
import "../styles/stock.css";

function StockDetail() {
    const { symbol } = useParams(); // comes from the route: /stock/:symbol

    const company = companies.find((c) => c.symbol === symbol) || companies[0];

    const [quote, setQuote] = useState(null);
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    const [balance, setBalance] = useState(50000);
    const [ownedShares, setOwnedShares] = useState(0);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        async function loadData() {
            const [quoteData, overviewData] = await Promise.all([
                fetchQuote(company.symbol),
                fetchOverview(company.symbol),
            ]);

            if (isMounted) {
                setQuote(quoteData);
                setOverview(overviewData);
                setLoading(false);
            }
        }

        loadData();

        return () => {
            isMounted = false; 
        };
    }, [company.symbol]);

    const handleBuy = (stock, quantity) => {
        const cost = stock.price * quantity;
        if (cost > balance) {
            alert("Insufficient balance");
            return;
        }
        setBalance((prev) => prev - cost);
        setOwnedShares((prev) => prev + quantity);
    };

    const handleSell = (stock, quantity) => {
        if (quantity > ownedShares) {
            alert("You don't own that many shares");
            return;
        }
        setBalance((prev) => prev + stock.price * quantity);
        setOwnedShares((prev) => prev - quantity);
    };

    if (loading) {
        return <p className="loading-text">Loading {company.name}...</p>;
    }

    return (
        <main className="stock-detail">
            <section className="stock-header">
                <div>
                    <p className="stock-symbol">{company.symbol}</p>
                    <h1>{company.name}</h1>
                    <div className="price-row">
                        <span className="stock-price">${quote.price.toFixed(2)}</span>
                        <span className={quote.change >= 0 ? "positive-text" : "negative-text"}>
                            {quote.change >= 0 ? "+" : ""}
                            {quote.change.toFixed(2)}%
                        </span>
                    </div>
                    {quote.error && (
                        <p className="api-warning">
                            Live data unavailable right now (API limit or network issue) — showing fallback values.
                        </p>
                    )}
                </div>
                <p className="balance-display">Balance: ${balance.toFixed(2)}</p>
            </section>

            <section className="fundamentals">
                <h2>Fundamentals</h2>
                <table>
                    <tbody>
                        <tr><td>P/E Ratio</td><td>{overview.peRatio}</td></tr>
                        <tr><td>Market Cap</td><td>{overview.marketCap}</td></tr>
                        <tr><td>52-Week High</td><td>${overview.week52High}</td></tr>
                        <tr><td>52-Week Low</td><td>${overview.week52Low}</td></tr>
                        <tr><td>Dividend Yield</td><td>{overview.dividendYield}</td></tr>
                    </tbody>
                </table>
            </section>

            <BuySellForm
                stock={{ symbol: company.symbol, price: quote.price }}
                ownedShares={ownedShares}
                onBuy={handleBuy}
                onSell={handleSell}
            />
        </main>
    );
}

export default StockDetail;

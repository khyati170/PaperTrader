import { useMemo } from "react";
import "../stockDetail.css";

function GainersLosersWidget({ quotes }) {
    const { gainers, losers } = useMemo(() => {
        const sorted = [...quotes].sort((a, b) => b.change - a.change);
        return {
            gainers: sorted.slice(0, 3),
            losers: sorted.slice(-3).reverse(),
        };
    }, [quotes]);

    if (quotes.length === 0) return null;

    return (
        <section className="gainers-losers">
            <div>
                <h3>Top Gainers</h3>
                {gainers.map((s) => (
                    <p key={s.symbol} className="positive-text">
                        {s.symbol}: +{s.change.toFixed(2)}%
                    </p>
                ))}
            </div>
            <div>
                <h3>Top Losers</h3>
                {losers.map((s) => (
                    <p key={s.symbol} className="negative-text">
                        {s.symbol}: {s.change.toFixed(2)}%
                    </p>
                ))}
            </div>
        </section>
    );
}

export default GainersLosersWidget;
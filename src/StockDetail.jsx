import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getStocks } from "./data/stocks.js";
import { getQuote, getProfile, getMetrics, getRatings, getPeers, getNews, } from "./data/stockExtras.js";
import { isMarketOpen } from "./config/marketConfig.js";
import TradeModal from "./components/TradeModal.jsx";
import "./stockDetail.css";

const POLL_MS = 30000;
const MAX_POINTS = 60;

const usd = (n) =>
    n == null || Number.isNaN(Number(n))
        ? "—"
        : `$${Number(n).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

const formatMarketCap = (millions) => {
    if (!millions) return "—";
    if (millions >= 1e6) return `$${(millions / 1e6).toFixed(2)}T`;
    if (millions >= 1e3) return `$${(millions / 1e3).toFixed(1)}B`;
    return `$${millions.toFixed(0)}M`;
};

const timeLabel = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const timeAgo = (unixSeconds) => {
    const diff = Math.floor(Date.now() / 1000) - unixSeconds;
    if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
};

const EMPTY_EXTRAS = {
    loaded: false,
    profile: null,
    metrics: null,
    ratings: null,
    peers: null,
    news: null,
};

function StockDetail({
    balance,
    holdings,
    onBuy,
    onSell,
    watchlist = [],
    toggleWatchlist = () => { },
}) {
    const { symbol } = useParams();
    const navigate = useNavigate();

    const [stock, setStock] = useState(null);
    const [allStocks, setAllStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [series, setSeries] = useState([]);
    const [extras, setExtras] = useState(EMPTY_EXTRAS);
    const [infoTab, setInfoTab] = useState("news");

    const [tradeMode, setTradeMode] = useState(null); // null | "buy" | "sell"
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const hasStock = stock !== null;

    // 1. Stock ka data load karo
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(false);

        getStocks()
            .then((result) => {
                if (!isMounted) return;
                const list = result?.stocks || [];
                const found = list.find((s) => s.symbol === symbol) || null;

                setAllStocks(list);
                setStock(found);

                if (found) {
                    setSeries([
                        { label: "Open", price: found.openprice || found.price },
                        { label: timeLabel(), price: found.price },
                    ]);
                } else {
                    setSeries([]);
                }
                setLoading(false);
            })
            .catch(() => {
                if (!isMounted) return;
                setError(true);
                setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [symbol]);

    useEffect(() => {
        let alive = true;
        setExtras(EMPTY_EXTRAS);
        setInfoTab("news");

        Promise.all([
            getProfile(symbol),
            getMetrics(symbol),
            getRatings(symbol),
            getPeers(symbol),
            getNews(symbol),
        ]).then(([profile, metrics, ratings, peers, news]) => {
            if (!alive) return;
            setExtras({ loaded: true, profile, metrics, ratings, peers, news });
        });

        return () => {
            alive = false;
        };
    }, [symbol]);

    useEffect(() => {
        if (!hasStock || !isMarketOpen()) return;
        let cancelled = false;

        const id = setInterval(async () => {
            if (document.hidden) return;
            const quote = await getQuote(symbol);
            if (cancelled || !quote) return;

            setStock((prev) => (prev ? { ...prev, ...quote } : prev));
            setSeries((prev) =>
                [...prev, { label: timeLabel(), price: quote.price }].slice(-MAX_POINTS)
            );
        }, POLL_MS);

        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [symbol, hasStock]);

    useEffect(() => {
        if (!showSuccess) return;
        const id = setTimeout(() => navigate("/portfolio"), 3500);
        return () => clearTimeout(id);
    }, [showSuccess, navigate]);

    // ---------- Trade handler ----------
    const ownedShares = Number(holdings[symbol]?.quantity) || 0;
    const avgBuyPrice = Number(holdings[symbol]?.avgBuyPrice) || 0;

    const handleTrade = (quantity) => {
        const isBuy = tradeMode === "buy";
        const success = isBuy
            ? onBuy(stock.symbol, stock.price, quantity)
            : onSell(stock.symbol, stock.price, quantity);

        if (success === false) return false;

        setTradeMode(null);
        setSuccessMessage(
            isBuy
                ? `You've successfully bought ${quantity} share(s) of ${stock.symbol}.`
                : `You've successfully sold ${quantity} share(s) of ${stock.symbol}.`
        );
        setShowSuccess(true);
        return true;
    };

    // ---------- Early returns ----------
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

    // ---------- Calculations ----------
    const { profile, metrics, ratings, peers, news } = extras;
    const marketOpen = isMarketOpen();
    const isWatchlisted = watchlist.includes(stock.symbol);

    const dayChange = stock.price - stock.previousclose;
    const changePct = Number(stock.change) || 0;
    const up = dayChange >= 0;

    const rangeSpan = stock.highprice - stock.lowprice;
    const rangePercent =
        rangeSpan > 0
            ? Math.min(100, Math.max(0, ((stock.price - stock.lowprice) / rangeSpan) * 100))
            : 50;

    const sessionStart = series[0]?.price || stock.price;
    const sessionChange = sessionStart ? ((stock.price - sessionStart) / sessionStart) * 100 : 0;

    const marketValue = stock.price * ownedShares;
    const positionPL = (stock.price - avgBuyPrice) * ownedShares;
    const positionPLPct = avgBuyPrice > 0 ? (stock.price / avgBuyPrice - 1) * 100 : 0;

    let signal = { label: "HOLD", index: 1, text: "Price is within its normal range today." };
    if (changePct >= 2) {
        signal = { label: "BUY", index: 2, text: "Price is rising strongly today." };
    } else if (changePct <= -2) {
        signal = { label: "SELL", index: 0, text: "Price is falling sharply today." };
    }

    const has52 = metrics?.high52 != null && metrics?.low52 != null && metrics.high52 > metrics.low52;
    const range52Percent = has52
        ? Math.min(100, Math.max(0, ((stock.price - metrics.low52) / (metrics.high52 - metrics.low52)) * 100))
        : 50;

    const ratingRows = ratings
        ? [
            { key: "strongBuy", label: "Strong buy", count: ratings.strongBuy, color: "#0b5a43" },
            { key: "buy", label: "Buy", count: ratings.buy, color: "#5dae8b" },
            { key: "hold", label: "Hold", count: ratings.hold, color: "#e0902b" },
            { key: "sell", label: "Sell", count: ratings.sell, color: "#d9826b" },
            { key: "strongSell", label: "Strong sell", count: ratings.strongSell, color: "#a5432d" },
        ]
        : [];
    const ratingsTotal = ratingRows.reduce((sum, r) => sum + r.count, 0);

    const knownSymbols = new Set(allStocks.map((s) => s.symbol));
    const similar = (peers || []).filter((s) => knownSymbols.has(s)).slice(0, 6);

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

            <nav className="sd-breadcrumb">
                <Link to="/market">Market</Link> / <b>{stock.symbol}</b>
            </nav>

            {/* ---------- Header ---------- */}
            <section className="sd-card sd-header">
                <div className="sd-id">
                    {profile?.logo ? (
                        <img className="sd-logo" src={profile.logo} alt="" />
                    ) : (
                        <div className="sd-logo sd-logo-fallback">{stock.symbol.slice(0, 2)}</div>
                    )}

                    <div className="sd-id-text">
                        <div className="sd-title-row">
                            <h1>{stock.name || stock.symbol}</h1>
                            <span className="sd-tag">{stock.symbol}</span>
                            {stock.sector && <span className="sd-tag">{stock.sector}</span>}
                        </div>

                        <div className="sd-price-row">
                            <span className="sd-price">{usd(stock.price)}</span>
                            <span className={up ? "sd-change up" : "sd-change down"}>
                                {up ? "+" : "-"}${Math.abs(dayChange).toFixed(2)} ({up ? "+" : ""}
                                {changePct.toFixed(2)}%)
                            </span>
                            <span className={marketOpen ? "sd-badge open" : "sd-badge closed"}>
                                <i /> {marketOpen ? "Market open" : "Market closed"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="sd-actions-wrap">
                    <div className="sd-actions">
                        <button
                            className={isWatchlisted ? "sd-star active" : "sd-star"}
                            onClick={() => toggleWatchlist(stock.symbol)}
                            aria-pressed={isWatchlisted}
                            aria-label={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill={isWatchlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                                <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z" />
                            </svg>
                        </button>
                        <button className="sd-btn buy" onClick={() => setTradeMode("buy")}>Buy</button>
                        <button className="sd-btn sell" onClick={() => setTradeMode("sell")}>Sell</button>
                    </div>
                    <p className="sd-balance">
                        Available balance <b>{usd(balance)}</b>
                    </p>
                </div>
            </section>
            {/* ---------- Chart ---------- */}
            <section className="sd-card">
                <div className="sd-chart-head">
                    <span className="sd-muted">
                        {marketOpen
                            ? "Live, updates every 30 seconds"
                            : "Market is closed. Showing the latest available prices."}
                    </span>
                    <span className={sessionChange >= 0 ? "sd-up-text" : "sd-down-text"}>
                        {sessionChange >= 0 ? "+" : ""}
                        {sessionChange.toFixed(2)}% this session
                    </span>
                </div>

                <div className="sd-chart">
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="sdFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.25} />
                                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 11, fill: "var(--color-eyebrow)" }}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                domain={["auto", "auto"]}
                                tick={{ fontSize: 11, fill: "var(--color-eyebrow)" }}
                                tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
                                width={68}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                formatter={(v) => [usd(v), "Price"]}
                                contentStyle={{
                                    background: "var(--color-bg-alt)",
                                    border: "none",
                                    borderRadius: 8,
                                    color: "var(--color-heading)",
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="var(--color-accent)"
                                strokeWidth={2.2}
                                fill="url(#sdFill)"
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="sd-ohlc">
                    <div><span>Open</span><b>{usd(stock.openprice)}</b></div>
                    <div><span>Prev close</span><b>{usd(stock.previousclose)}</b></div>
                    <div><span>Day high</span><b className="sd-up-text">{usd(stock.highprice)}</b></div>
                    <div><span>Day low</span><b className="sd-down-text">{usd(stock.lowprice)}</b></div>
                </div>

                <div className="sd-range">
                    <div className="sd-range-fill" style={{ width: `${rangePercent}%` }} />
                    <div className="sd-range-dot" style={{ left: `${rangePercent}%` }} />
                </div>
            </section>

            {/* ---------- Position + Signal ---------- */}
            <div className="sd-grid-2">
                <section className="sd-card">
                    <h2 className="sd-card-title">Your position</h2>
                    {ownedShares > 0 ? (
                        <div className="sd-rows">
                            <div><span>Shares owned</span><b>{ownedShares}</b></div>
                            <div><span>Avg buy price</span><b>{usd(avgBuyPrice)}</b></div>
                            <div><span>Market value</span><b>{usd(marketValue)}</b></div>
                            <div>
                                <span>Profit / loss</span>
                                <b className={positionPL >= 0 ? "sd-pill up" : "sd-pill down"}>
                                    {positionPL >= 0 ? "+" : "-"}${Math.abs(positionPL).toFixed(2)} (
                                    {positionPLPct >= 0 ? "+" : ""}
                                    {positionPLPct.toFixed(2)}%)
                                </b>
                            </div>
                        </div>
                    ) : (
                        <p className="sd-muted">You don't own any shares of {stock.symbol} yet.</p>
                    )}
                </section>

                <section className="sd-card">
                    <div className="sd-signal-head">
                        <h2 className="sd-card-title">Signal</h2>
                        <span className="sd-signal-badge">{signal.label}</span>
                    </div>
                    <div className="sd-signal-bar">
                        <i className={signal.index === 0 ? "seg sell on" : "seg sell"} />
                        <i className={signal.index === 1 ? "seg hold on" : "seg hold"} />
                        <i className={signal.index === 2 ? "seg buy on" : "seg buy"} />
                    </div>
                    <div className="sd-signal-labels">
                        <span>Sell</span>
                        <span>Hold</span>
                        <span>Buy</span>
                    </div>
                    <p className="sd-signal-text">{signal.text}</p>
                    <p className="sd-note">Based on today's price change. Not financial advice.</p>
                </section>
            </div>

            {/* ---------- Key stats + Analyst ratings ---------- */}
            <div className="sd-grid-2">
                <section className="sd-card">
                    <h2 className="sd-card-title">Key stats</h2>
                    {!extras.loaded ? (
                        <p className="sd-muted">Loading...</p>
                    ) : !metrics ? (
                        <p className="sd-muted">Key stats aren't available right now.</p>
                    ) : (
                        <>
                            <p className="sd-sub">52-week range</p>
                            {has52 ? (
                                <>
                                    <div className="sd-range wide">
                                        <div className="sd-range-dot" style={{ left: `${range52Percent}%` }} />
                                    </div>
                                    <div className="sd-range-labels">
                                        <span>Low {usd(metrics.low52)}</span>
                                        <span>High {usd(metrics.high52)}</span>
                                    </div>
                                </>
                            ) : (
                                <p className="sd-muted">—</p>
                            )}

                            <div className="sd-stats-grid">
                                <div><span>Market cap</span><b>{formatMarketCap(profile?.marketCapitalization)}</b></div>
                                <div><span>P/E ratio</span><b>{metrics.pe != null ? metrics.pe.toFixed(2) : "—"}</b></div>
                                <div><span>Beta</span><b>{metrics.beta != null ? metrics.beta.toFixed(2) : "—"}</b></div>
                                <div>
                                    <span>Dividend yield</span>
                                    <b>{metrics.dividendYield != null ? `${metrics.dividendYield.toFixed(2)}%` : "—"}</b>
                                </div>
                            </div>
                        </>
                    )}
                </section>

                <section className="sd-card">
                    <h2 className="sd-card-title">Analyst ratings</h2>
                    {!extras.loaded ? (
                        <p className="sd-muted">Loading...</p>
                    ) : !ratings || ratingsTotal === 0 ? (
                        <p className="sd-muted">Analyst ratings aren't available right now.</p>
                    ) : (
                        <>
                            <div className="sd-ratings-bar">
                                {ratingRows
                                    .filter((r) => r.count > 0)
                                    .map((r) => (
                                        <div key={r.key} style={{ flex: r.count, background: r.color }} />
                                    ))}
                            </div>
                            <div className="sd-ratings-list">
                                {ratingRows.map((r) => (
                                    <div key={r.key}>
                                        <span>
                                            <i style={{ background: r.color }} />
                                            {r.label}
                                        </span>
                                        <b>{r.count}</b>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </div>

            {/* ---------- News / About ---------- */}
            <section className="sd-card">
                <div className="sd-tabs" role="tablist">
                    <button
                        role="tab"
                        aria-selected={infoTab === "news"}
                        className={infoTab === "news" ? "sd-tab active" : "sd-tab"}
                        onClick={() => setInfoTab("news")}
                    >
                        News
                    </button>
                    <button
                        role="tab"
                        aria-selected={infoTab === "about"}
                        className={infoTab === "about" ? "sd-tab active" : "sd-tab"}
                        onClick={() => setInfoTab("about")}
                    >
                        About
                    </button>
                </div>

                {infoTab === "news" && (
                    <>
                        {!extras.loaded ? (
                            <p className="sd-muted">Loading...</p>
                        ) : !news || news.length === 0 ? (
                            <p className="sd-muted">No recent news for {stock.symbol}.</p>
                        ) : (
                            <div className="sd-news">
                                {news.map((n) => (
                                    <a
                                        key={n.id || n.url}
                                        href={n.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="sd-news-item"
                                    >
                                        <div>
                                            <p className="sd-news-title">{n.title}</p>
                                            <p className="sd-news-meta">
                                                {n.source} · {timeAgo(n.datetime)}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {infoTab === "about" && (
                    <>
                        {!extras.loaded ? (
                            <p className="sd-muted">Loading...</p>
                        ) : !profile ? (
                            <p className="sd-muted">Company info isn't available right now.</p>
                        ) : (
                            <div className="sd-stats-grid">
                                <div><span>Industry</span><b>{profile.finnhubIndustry || "—"}</b></div>
                                <div><span>Exchange</span><b>{profile.exchange || "—"}</b></div>
                                <div><span>IPO date</span><b>{profile.ipo || "—"}</b></div>
                                <div>
                                    <span>Website</span>
                                    <b>
                                        {profile.weburl ? (
                                            <a href={profile.weburl} target="_blank" rel="noopener noreferrer">
                                                {profile.weburl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                                            </a>
                                        ) : (
                                            "—"
                                        )}
                                    </b>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* ---------- Similar stocks ---------- */}
            {similar.length > 0 && (
                <section className="sd-card sd-peers">
                    <span className="sd-peers-title">Similar stocks</span>
                    {similar.map((s) => (
                        <Link key={s} to={`/stock/${s}`} className="sd-chip">
                            {s}
                        </Link>
                    ))}
                </section>
            )}

            {/* ---------- Buy / Sell modal ---------- */}
            <TradeModal
                isOpen={tradeMode !== null}
                mode={tradeMode}
                stock={{ symbol: stock.symbol, price: stock.price }}
                ownedShares={ownedShares}
                avgBuyPrice={avgBuyPrice}
                balance={balance}
                onConfirm={handleTrade}
                onCancel={() => setTradeMode(null)}
            />
        </main>
    );
}

export default StockDetail;
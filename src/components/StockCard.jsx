
import { useMemo, useState } from "react";
import { usePriceFlash } from "../hooks/animations";

const W = 200;
const H = 64;
const PAD = 8;

function smoothPath(pts) {
  if (pts.length < 2) return "";

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;

    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(
      1
    )} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

export default function StockCard({
  symbol,
  company,
  price,
  currency = "$",
  change,
  hp,
  lp,
  op,
  isWatchlisted,
  onWatchlistClick,
  view = "chart",
  history = [],
}) {
  const isUp = change >= 0;
  const showChart = view === "chart";
  const flash = usePriceFlash(price);
  const [hover, setHover] = useState(null);

  const chart = useMemo(() => {
    if (!showChart || history.length < 2) return null;

    const values = op != null && !isNaN(op) ? [...history, op] : history;

    const lo = Math.min(...values);
    const hi = Math.max(...values);
    const range = hi - lo || 1;

    const toY = (v) =>
      PAD + (1 - (v - lo) / range) * (H - PAD * 2);

    const pts = history.map((v, i) => ({
      x: (i / (history.length - 1)) * W,
      y: toY(v),
    }));

    const line = smoothPath(pts);

    return {
      pts,
      line,
      area: `${line} L ${W} ${H} L 0 ${H} Z`,
      baseY: op != null && !isNaN(op) ? toY(op) : null,
    };
  }, [showChart, history, op]);

  const rangePct =
    hp > lp
      ? Math.min(
          100,
          Math.max(0, ((price - lp) / (hp - lp)) * 100)
        )
      : 50;

  const handleMove = (e) => {
    if (!chart) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const ratio =
      (e.clientX - rect.left) / rect.width;

    const idx = Math.round(
      Math.min(1, Math.max(0, ratio)) *
        (history.length - 1)
    );

    setHover(idx);
  };

  const gid = `grad-${symbol.replace(
    /[^a-zA-Z0-9]/g,
    ""
  )}`;

  const active =
    hover != null && chart
      ? chart.pts[hover]
      : null;

  const last = chart
    ? chart.pts[chart.pts.length - 1]
    : null;

  const fmt = (v) =>
    v == null || isNaN(v)
      ? "—"
      : `${currency}${Number(v).toFixed(2)}`;

  const handleViewStock = () => {
    window.location.href = `/stock/${symbol}`;
  };

  const handleWatchlist = (e) => {
  e.stopPropagation();
  onWatchlistClick?.(e);
};

  return (
    <div className="stock-card">

      {/* TOP */}
      <div className="sc-top">
        <div className="sc-heading">
          <h3>{symbol}</h3>
          <p>{company}</p>
        </div>

        <button
          className={`sc-star ${
            isWatchlisted ? "active" : ""
          }`}
          onClick={handleWatchlist}
          aria-label={
            isWatchlisted
              ? "Remove from watchlist"
              : "Add to watchlist"
          }
        >
          {isWatchlisted ? "★" : "☆"}
        </button>
      </div>

      {/* PRICE */}
      <div className="sc-price-row">
        <span className={`sc-price ${flash}`}>
          {fmt(price)}
        </span>

        <span
          className={`sc-pill ${
            isUp ? "up" : "down"
          }`}
        >
          {isUp ? "▲" : "▼"}{" "}
          {isUp ? "+" : ""}
          {Number(change).toFixed(2)}%
        </span>
      </div>

      {/* BODY */}
      <div className="sc-body">

        {showChart ? (
          <>
            <div
              className={`sc-chart ${
                isUp ? "up" : "down"
              }`}
              onMouseMove={handleMove}
              onMouseLeave={() => setHover(null)}
            >
              {chart && (
                <>
                  <svg
                    viewBox={`0 0 ${W} ${H}`}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id={gid}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="currentColor"
                          stopOpacity="0.28"
                        />

                        <stop
                          offset="100%"
                          stopColor="currentColor"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    {chart.baseY != null && (
                      <line
                        className="sc-base"
                        x1="0"
                        x2={W}
                        y1={chart.baseY}
                        y2={chart.baseY}
                        vectorEffect="non-scaling-stroke"
                      />
                    )}

                    <path
                      d={chart.area}
                      fill={`url(#${gid})`}
                    />

                    <path
                      className="sc-line"
                      d={chart.line}
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>

                  {last && hover == null && (
                    <span
                      className="sc-dot live"
                      style={{
                        left: `${
                          (last.x / W) * 100
                        }%`,
                        top: `${
                          (last.y / H) * 100
                        }%`,
                      }}
                    />
                  )}

                  {active && (
                    <>
                      <span
                        className="sc-hline"
                        style={{
                          left: `${
                            (active.x / W) * 100
                          }%`,
                        }}
                      />

                      <span
                        className="sc-dot"
                        style={{
                          left: `${
                            (active.x / W) * 100
                          }%`,
                          top: `${
                            (active.y / H) * 100
                          }%`,
                        }}
                      />

                      <span
                        className="sc-tip"
                        style={{
                          left: `${Math.min(
                            86,
                            Math.max(
                              14,
                              (active.x / W) * 100
                            )
                          )}%`,
                        }}
                      >
                        {fmt(history[hover])}
                      </span>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="sc-range">
              <div className="sc-track">
                <div
                  className="sc-marker"
                  style={{
                    left: `${rangePct}%`,
                  }}
                />
              </div>

              <div className="sc-range-labels">
                <span>
                  <em>Low</em> {fmt(lp)}
                </span>

                <span>
                  <em>High</em> {fmt(hp)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="sc-stats">

            <div>
              <span>Open</span>
              <b>{fmt(op)}</b>
            </div>

            <div>
              <span>Day range</span>
              <b>{fmt(hp - lp)}</b>
            </div>

            <div>
              <span>Low</span>
              <b>{fmt(lp)}</b>
            </div>

            <div>
              <span>High</span>
              <b>{fmt(hp)}</b>
            </div>

          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="stock-actions">

        <button
          className="view-stock-btn"
          onClick={handleViewStock}
        >
          View Stock
        </button>

        <button
          className={`watchlist-btn ${
            isWatchlisted ? "added" : ""
          }`}
          onClick={handleWatchlist}
        >
          {isWatchlisted
            ? "✓ Added"
            : "+ Watchlist"}
        </button>

      </div>

    </div>
  );
}
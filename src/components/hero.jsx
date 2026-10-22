import { useState ,useEffect} from "react";
import { Link } from "react-router-dom";

const VALUE = "$106,284.40";


const RANGES = {
  "1D": {
    change: "+1.12%",
    marker: null,
    series: [105110, 105230, 105160, 105340, 105290, 105470, 105400, 105620, 105560, 105780, 105700, 105900, 105840, 106010, 105950, 106120, 106070, 106200, 106150, 106284],
  },
  "1W": {
    change: "+3.40%",
    marker: null,
    series: [102800, 103000, 102920, 103350, 103200, 103600, 103540, 104100, 104000, 104520, 104400, 104900, 105100, 105020, 105500, 105420, 105800, 106000, 105950, 106284],
  },
  "1M": {
    change: "+6.28%",
    marker: { at: 11, label: "Earnings +3.2%" },
    series: [100000, 100420, 100180, 100890, 101300, 101050, 101780, 102210, 101960, 102580, 102900, 105950, 105600, 106050, 105720, 106120, 105890, 106240, 106020, 106284],
  },
};

const STATS = [
  { value: "$100K", label: "virtual cash to start" },
  { value: "Live", label: "real market prices" },
  { value: "52-week", label: "range-based buy signals" },
  { value: "CAGR", label: "what-if projections" },
];

const CHECKS = ["Real market data", "Buy and sell signals", "No card needed"];

const W = 400;
const H = 160;
const PAD = 16;

function Hero() {
  const [range, setRange] = useState("1M");
  const { series, change, marker } = RANGES[range];

  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const pts = series.map((v, i) => [
    (i * W) / (series.length - 1),
    PAD + (1 - (v - min) / span) * (H - PAD * 2),
  ]);
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const mark = marker ? pts[marker.at] : null;

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="hero-badge">
              <span className="hero-badge-dot" />
              Live prices and $100,000 in virtual cash
            </p>

            <h1 className="hero-title">
              Trade real markets.
              <span>Risk nothing.</span>
            </h1>

            <p className="hero-text">
              PaperTrader gives you $100,000 in virtual cash and live market prices. Build a
              portfolio, test your ideas, and learn from every trade, with no real money at stake.
            </p>

            <div className="hero-buttons">
              <Link to="/login" className="hero-primary">
                Start with $100,000
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link to="/market" className="hero-secondary">Browse stocks</Link>
            </div>

            <ul className="hero-checks">
              {CHECKS.map((c) => (
                <li key={c}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-visual">
            <div className="hero-toast">
              <span className="hero-toast-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
              </span>
              <div>
                <strong>Order filled</strong>
                <span>Bought 10 AAPL</span>
              </div>
            </div>

            <div className="hero-card">
              <div className="hero-card-top">
                <span>Portfolio value</span>
                <div className="hero-tabs" role="group" aria-label="Chart range">
                  {Object.keys(RANGES).map((r) => (
                    <button key={r} type="button" aria-pressed={r === range} onClick={() => setRange(r)}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hero-value">
                {VALUE}
                <span className="hero-gain">▲ {change}</span>
              </div>

              <div className="hero-chart">
                <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`Portfolio value over ${range}`}>
                  <polygon points={`0,${H} ${line} ${W},${H}`} className="hero-area" />
                  <polyline points={line} className="hero-line" vectorEffect="non-scaling-stroke" />
                </svg>

                {mark && (
                  <>
                    <span className="hero-marker-line" style={{ left: `${(mark[0] / W) * 100}%`, top: `${(mark[1] / H) * 100}%` }} />
                    <span className="hero-marker-dot" style={{ left: `${(mark[0] / W) * 100}%`, top: `${(mark[1] / H) * 100}%` }} />
                    <span className="hero-marker-chip" style={{ left: `${(mark[0] / W) * 100}%`, top: `${(mark[1] / H) * 100}%` }}>
                      {marker.label}
                    </span>
                  </>
                )}
              </div>

              <div className="hero-holding">
                <span><strong>AAPL</strong> 10 shares</span>
                <span className="hero-holding-gain">$1,874.20 ▲ 1.84%</span>
              </div>
            </div>

            <div className="hero-signal">
              <p className="hero-signal-tag"><span /> Buy signal</p>
              <p className="hero-signal-text">AAPL is in the bottom 20% of its 52-week range</p>
              <div className="hero-signal-bar"><i /></div>
              <div className="hero-signal-ends"><span>$164.10</span><span>$199.62</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="hero-stats-wrap">
        <ul className="hero-stats">
          {STATS.map((s) => (
            <li className="hero-stat" key={s.value}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default Hero;
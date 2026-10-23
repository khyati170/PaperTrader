import { useState } from "react";

const W = 600;
const H = 160;
const PAD = 14;

export default function PriceChart({ data, live = true }) {
    const [hoverIdx, setHoverIdx] = useState(null);

    if (!data || data.length < 2) return null;

    const n = data.length;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;

    const xs = data.map((_, i) => (i / (n - 1)) * W);
    const ys = data.map((v) => PAD + (1 - (v - min) / span) * (H - PAD * 2));

    const line = data.map((_, i) => `${xs[i].toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
    const baseY = ys[0]; // pehle point ka level (dashed baseline)

    const isUp = data[n - 1] >= data[0];
    const dir = isUp ? "up" : "down";

    const activeIdx = hoverIdx ?? n - 1;
    const leftPct = (xs[activeIdx] / W) * 100;
    const topPct = (ys[activeIdx] / H) * 100;
    const tipLeft = Math.min(92, Math.max(8, leftPct)); // tooltip edge se bahar na jaye

    const pickIndex = (clientX, el) => {
        const rect = el.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        setHoverIdx(Math.round(ratio * (n - 1)));
    };

    return (
        <div className="price-chart">
            <div
                className={`pc-chart ${dir}`}
                onMouseMove={(e) => pickIndex(e.clientX, e.currentTarget)}
                onMouseLeave={() => setHoverIdx(null)}
                onTouchMove={(e) => pickIndex(e.touches[0].clientX, e.currentTarget)}
                onTouchEnd={() => setHoverIdx(null)}
            >
                <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Price chart">
                    <line className="pc-base" x1="0" x2={W} y1={baseY} y2={baseY} vectorEffect="non-scaling-stroke" />
                    <polyline className="pc-line" points={line} vectorEffect="non-scaling-stroke" />
                </svg>

                {hoverIdx !== null && (
                    <>
                        <div className="pc-hline" style={{ left: `${leftPct}%` }} />
                        <div className="pc-tip" style={{ left: `${tipLeft}%` }}>
                            ${data[hoverIdx].toFixed(2)}
                        </div>
                    </>
                )}

                <div
                    className={`pc-dot ${hoverIdx === null && live ? "live" : ""}`}
                    style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                />
            </div>

            <div className="pc-meta">
                <span>Low ${min.toFixed(2)}</span>
                <span><i className="live-dot" /> Live · updates every 30s</span>
                <span>High ${max.toFixed(2)}</span>
            </div>
        </div>
    );
}

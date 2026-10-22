import { useState } from "react";
import "./WhatIf.css";

const usd = (n, d = 2) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

const signed = (n, format) => (n > 0 ? "+" : n < 0 ? "−" : "") + format(Math.abs(n));
const toneOf = (n) => (n > 0 ? "up" : n < 0 ? "down" : "flat");

const bigMoney = (n) => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)} trillion`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)} billion`;
  return `$${(n / 1e6).toFixed(2)} million`;
};

/* Each config: sliders (with defaults) and a compute() that returns outputs + a note. */
const CONFIGS = {
  "price-change": {
    title: "Price change calculator",
    sliders: [
      { key: "prev", label: "Previous close", min: 50, max: 500, step: 1, value: 235, fmt: (v) => usd(v, 0) },
      { key: "cur", label: "Current price", min: 50, max: 500, step: 1, value: 240, fmt: (v) => usd(v, 0) },
    ],
    compute: ({ prev, cur }) => {
      const change = cur - prev;
      const pct = (change / prev) * 100;
      return {
        outputs: [
          { label: "Change", value: signed(change, (v) => usd(v)), tone: toneOf(change) },
          { label: "Change %", value: signed(pct, (v) => `${v.toFixed(2)}%`), tone: toneOf(change) },
        ],
        note: `(${usd(cur, 0)} − ${usd(prev, 0)}) ÷ ${usd(prev, 0)} × 100 = ${pct.toFixed(2)}%`,
      };
    },
  },

  "market-cap": {
    title: "Market cap calculator",
    sliders: [
      { key: "price", label: "Share price", min: 1, max: 1000, step: 1, value: 50, fmt: (v) => usd(v, 0) },
      { key: "shares", label: "Shares outstanding", min: 1, max: 5000, step: 1, value: 10, fmt: (v) => `${v.toLocaleString()} million` },
    ],
    compute: ({ price, shares }) => {
      const cap = price * shares * 1e6;
      let size = "Micro cap";
      if (cap >= 2e11) size = "Mega cap";
      else if (cap >= 1e10) size = "Large cap";
      else if (cap >= 2e9) size = "Mid cap";
      else if (cap >= 3e8) size = "Small cap";
      return {
        outputs: [
          { label: "Market cap", value: bigMoney(cap) },
          { label: "Size class (rough guide)", value: size },
        ],
        note: `${usd(price, 0)} × ${shares.toLocaleString()} million shares. Try a cheap price with a huge share count.`,
      };
    },
  },

  "pe-eps": {
    title: "P/E ratio calculator",
    sliders: [
      { key: "price", label: "Share price", min: 10, max: 500, step: 1, value: 150, fmt: (v) => usd(v, 0) },
      { key: "eps", label: "Earnings per share (EPS)", min: 0.5, max: 50, step: 0.5, value: 5, fmt: (v) => usd(v) },
    ],
    compute: ({ price, eps }) => {
      const pe = price / eps;
      let read = "Moderate";
      if (pe < 15) read = "Lower: cheap, or slow growth";
      else if (pe > 25) read = "Higher: growth expected";
      return {
        outputs: [
          { label: "P/E ratio", value: pe.toFixed(1) },
          { label: "Rough read", value: read },
        ],
        note: `You pay ${usd(pe)} for every $1 of yearly profit. Compare P/E between similar companies only.`,
      };
    },
  },

  "position-sizing": {
    title: "Position size calculator",
    sliders: [
      { key: "account", label: "Account size", min: 1000, max: 100000, step: 500, value: 10000, fmt: (v) => usd(v, 0) },
      { key: "risk", label: "Risk per trade", min: 0.25, max: 5, step: 0.25, value: 1, fmt: (v) => `${v}%` },
      { key: "entry", label: "Entry price", min: 5, max: 500, step: 0.5, value: 50, fmt: (v) => usd(v) },
      { key: "stopPct", label: "Stop loss", min: 1, max: 20, step: 0.5, value: 4, fmt: (v) => `${v}% below entry` },
      { key: "rr", label: "Reward target", min: 1, max: 5, step: 0.5, value: 3, fmt: (v) => `${v}:1` },
    ],
    compute: ({ account, risk, entry, stopPct, rr }) => {
      const riskAmount = (account * risk) / 100;
      const perShare = (entry * stopPct) / 100;
      const stop = entry - perShare;
      let shares = Math.floor(riskAmount / perShare + 1e-9);
      const affordable = Math.floor(account / entry);
      const capped = shares > affordable;
      if (capped) shares = affordable;
      const cost = shares * entry;
      const maxLoss = shares * perShare;
      const target = entry + rr * perShare;
      const profit = shares * rr * perShare;
      return {
        outputs: [
          { label: "Shares to buy", value: shares.toLocaleString() },
          { label: "Stop price", value: usd(stop) },
          { label: "Position cost", value: usd(cost, 0) },
          { label: "Max loss if stopped out", value: `−${usd(maxLoss, 0)}`, tone: "down" },
          { label: "Target price", value: usd(target) },
          { label: "Potential profit", value: `+${usd(profit, 0)}`, tone: "up" },
        ],
        note: capped
          ? "Your cash limits the size: you cannot afford the full risk-based position. Widen the stop or raise the account."
          : `${usd(riskAmount, 0)} risk ÷ ${usd(perShare)} risk per share = ${shares} shares.`,
      };
    },
  },

  beta: {
    title: "Beta calculator",
    sliders: [
      { key: "market", label: "Market move", min: -10, max: 10, step: 0.5, value: -10, fmt: (v) => `${v > 0 ? "+" : ""}${v}%` },
      { key: "beta", label: "Stock beta", min: 0, max: 2.5, step: 0.1, value: 1.5, fmt: (v) => v.toFixed(1) },
    ],
    compute: ({ market, beta }) => {
      const move = market * beta;
      const dollars = (10000 * move) / 100;
      return {
        outputs: [
          { label: "Expected stock move", value: signed(move, (v) => `${v.toFixed(1)}%`), tone: toneOf(move) },
          { label: "On $10,000 invested", value: signed(dollars, (v) => usd(v, 0)), tone: toneOf(dollars) },
        ],
        note: "Beta comes from past data. It describes how the stock behaved before, not a promise.",
      };
    },
  },
};

const defaultsFor = (cfg) => Object.fromEntries(cfg.sliders.map((s) => [s.key, s.value]));

export default function WhatIf({ id }) {
  const cfg = CONFIGS[id];
  const [vals, setVals] = useState(() => (cfg ? defaultsFor(cfg) : {}));

  if (!cfg) return null;
  const result = cfg.compute(vals);

  return (
    <div className="ls-widget">
      <div className="ls-widget-head">
        <strong>Try it</strong>
        <span>{cfg.title}</span>
      </div>

      <div className="wi-body">
        <div className="wi-sliders">
          {cfg.sliders.map((s) => (
            <label key={s.key} className="wi-slider">
              <span className="wi-slider-top">
                <span>{s.label}</span>
                <b>{s.fmt(vals[s.key])}</b>
              </span>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={vals[s.key]}
                onChange={(e) => setVals((v) => ({ ...v, [s.key]: Number(e.target.value) }))}
              />
            </label>
          ))}
        </div>

        <div className="wi-outputs" aria-live="polite">
          {result.outputs.map((o) => (
            <div key={o.label} className={`wi-out wi-${o.tone || "flat"}`}>
              <span>{o.label}</span>
              <strong>{o.value}</strong>
            </div>
          ))}
          {result.note && <p className="wi-note">{result.note}</p>}
        </div>
      </div>

      <button type="button" className="ls-link wi-reset" onClick={() => setVals(defaultsFor(cfg))}>
        Reset
      </button>
    </div>
  );
}
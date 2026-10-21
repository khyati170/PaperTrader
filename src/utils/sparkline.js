// Starting shape: O/L/H/C se approximate curve (same stock = same shape)
export function buildSparkline(symbol, op, lp, hp, price) {
  const up = price >= op;
  const keys = up ? [op, lp, hp, price] : [op, hp, lp, price];

  let seed = [...symbol].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const pts = [];
  const steps = 18;
  const span = Math.max(hp - lp, 0.0001);
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * (keys.length - 1);
    const a = Math.floor(t);
    const b = Math.min(a + 1, keys.length - 1);
    const base = keys[a] + (keys[b] - keys[a]) * (t - a);
    const noise = (rand() - 0.5) * span * 0.12;
    pts.push(Math.min(hp, Math.max(lp, base + noise)));
  }
  pts[pts.length - 1] = price;
  return pts;
}

export function seedSeries(stock) {
  const { symbol, openprice: op, lowprice: lp, highprice: hp, price } = stock;
  if ([op, lp, hp, price].some((v) => v == null || isNaN(v))) return [price, price];
  return buildSparkline(symbol, op, lp, hp, price);
}
const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const BASE = "https://finnhub.io/api/v1";

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

const TTL = {
    profile: Infinity,
    metrics: DAY,
    ratings: DAY,
    peers: DAY,
    news: 30 * MINUTE,
};

function readCache(key, ttl) {
    try {
        const raw = localStorage.getItem(`finnhub:${key}`);
        if (!raw) return null;
        const { data, savedAt } = JSON.parse(raw);
        if (Date.now() - savedAt > ttl) return null;
        return data;
    } catch {
        return null;
    }
}

function writeCache(key, data) {
    try {
        localStorage.setItem(
            `finnhub:${key}`,
            JSON.stringify({ data, savedAt: Date.now() })
        );
    } catch {
        // storage full ya blocked: koi dikkat nahi, bas cache nahi hoga
    }
}

const isEmpty = (d) =>
    d == null ||
    (Array.isArray(d) ? d.length === 0 : typeof d === "object" && Object.keys(d).length === 0);

// Cache pehle, warna API. Fail ho to null (page nahi toot-ta).
async function cachedGet(cacheKey, path, ttl) {
    const cached = readCache(cacheKey, ttl);
    if (cached) return cached;

    try {
        const res = await fetch(`${BASE}${path}&token=${API_KEY}`);
        if (!res.ok) {
            console.warn("Finnhub request failed:", path, res.status);
            return null;
        }
        const data = await res.json();
        if (isEmpty(data)) return null;
        writeCache(cacheKey, data);
        return data;
    } catch (error) {
        console.warn("Finnhub request error:", path, error.message);
        return null;
    }
}

// Sirf ek symbol ka fresh price (chart polling ke liye, 1 call)
export async function getQuote(symbol) {
    try {
        const res = await fetch(`${BASE}/quote?symbol=${symbol}&token=${API_KEY}`);
        if (!res.ok) return null;
        const d = await res.json();
        if (!d || !d.c) return null;
        return {
            price: d.c,
            change: d.dp,
            highprice: d.h,
            lowprice: d.l,
            openprice: d.o,
            previousclose: d.pc,
        };
    } catch {
        return null;
    }
}

export async function getProfile(symbol) {
    return cachedGet(`profile:${symbol}`, `/stock/profile2?symbol=${symbol}`, TTL.profile);
}

export async function getMetrics(symbol) {
    const data = await cachedGet(
        `metrics:${symbol}`,
        `/stock/metric?symbol=${symbol}&metric=all`,
        TTL.metrics
    );
    const m = data?.metric;
    if (!m) return null;

    return {
        high52: m["52WeekHigh"] ?? null,
        low52: m["52WeekLow"] ?? null,
        pe: m.peTTM ?? m.peBasicExclExtraTTM ?? m.peNormalizedAnnual ?? null,
        beta: m.beta ?? null,
        dividendYield: m.dividendYieldIndicatedAnnual ?? null, // percent
    };
}

export async function getRatings(symbol) {
    const data = await cachedGet(
        `ratings:${symbol}`,
        `/stock/recommendation?symbol=${symbol}`,
        TTL.ratings
    );
    if (!Array.isArray(data) || data.length === 0) return null;

    const latest = data[0];
    return {
        strongBuy: latest.strongBuy || 0,
        buy: latest.buy || 0,
        hold: latest.hold || 0,
        sell: latest.sell || 0,
        strongSell: latest.strongSell || 0,
    };
}

// Similar stocks ke symbols
export async function getPeers(symbol) {
    const data = await cachedGet(`peers:${symbol}`, `/stock/peers?symbol=${symbol}`, TTL.peers);
    return Array.isArray(data) ? data.filter((s) => s !== symbol) : null;
}

// Pichle 7 din ki 5 latest headlines
export async function getNews(symbol) {
    const to = new Date();
    const from = new Date(Date.now() - 7 * DAY);
    const fmt = (d) => d.toISOString().slice(0, 10);

    const data = await cachedGet(
        `news:${symbol}`,
        `/company-news?symbol=${symbol}&from=${fmt(from)}&to=${fmt(to)}`,
        TTL.news
    );
    if (!Array.isArray(data)) return null;

    return data
        .filter((n) => n.headline && n.url)
        .sort((a, b) => b.datetime - a.datetime)
        .slice(0, 5)
        .map((n) => ({
            id: n.id,
            title: n.headline,
            source: n.source,
            url: n.url,
            image: n.image || "",
            datetime: n.datetime, // unix seconds
        }));
}
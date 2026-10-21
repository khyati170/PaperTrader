const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const stocksData = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com, Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "META", name: "Meta Platforms, Inc." },
  { symbol: "TSLA", name: "Tesla, Inc." },
  { symbol: "NFLX", name: "Netflix, Inc." },
  { symbol: "AMD", name: "Advanced Micro Devices, Inc." },
  { symbol: "INTC", name: "Intel Corporation" },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "MA", name: "Mastercard Incorporated" },
  { symbol: "WMT", name: "Walmart Inc." },
  { symbol: "DIS", name: "The Walt Disney Company" },
  { symbol: "KO", name: "The Coca-Cola Company" },
  { symbol: "PEP", name: "PepsiCo, Inc." },
  { symbol: "NKE", name: "NIKE, Inc." },
  { symbol: "ORCL", name: "Oracle Corporation" },
  { symbol: "ADBE", name: "Adobe Inc." }
];

const sectors = {
  AAPL: "IT",
  MSFT: "IT",
  GOOGL: "IT",
  AMZN: "IT",
  NVDA: "IT",
  META: "IT",
  NFLX: "IT",
  AMD: "IT",
  INTC: "IT",
  ORCL: "IT",
  ADBE: "IT",

  JPM: "Banking",
  V: "Banking",
  MA: "Banking",

  TSLA: "Auto",

  WMT: "Retail",
  DIS: "Entertainment",
  KO: "Food",
  PEP: "Food",
  NKE: "Retail"
};

let stocksPromise = null;
const CACHE_DURATION_MS = 60 * 1000;

export async function getStocks(market = "us") {
  const savedStocks = sessionStorage.getItem("stocks");
  const savedTimestamp = sessionStorage.getItem("stocksTimestamp");

  if (savedStocks && savedTimestamp) {
    const isExpired =
      Date.now() - Number(savedTimestamp) > CACHE_DURATION_MS;

    const parsedStocks = JSON.parse(savedStocks);

    if (!isExpired && parsedStocks.length > 0) {
      console.log("Using cached stocks");

      return {
        stocks: parsedStocks,
        isStale: false,
        fetchedAt: Number(savedTimestamp),
        noData: false,
      };
    }
  }

  if (stocksPromise) {
    console.log("Using existing stock request");
    return stocksPromise;
  }

  stocksPromise = (async () => {
    const stocks = [];

    for (const stockData of stocksData) {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${stockData.symbol}&token=${API_KEY}`
      );

      if (!response.ok) {
        console.log("Failed:", stockData.symbol, response.status);
        continue;
      }

      const data = await response.json();

      stocks.push({
        symbol: stockData.symbol,
        name: stockData.name,
        sector: sectors[stockData.symbol],
        price: data.c,
        change: data.dp,
        highprice: data.h,
        lowprice: data.l,
        openprice: data.o,
        previousclose: data.pc,
      });
    }

    const fetchedAt = Date.now();

    if (stocks.length === stocksData.length) {
      sessionStorage.setItem("stocks", JSON.stringify(stocks));
      sessionStorage.setItem("stocksTimestamp", fetchedAt.toString());
      console.log("Stocks saved to sessionStorage");
    } else {
      console.log("Some stocks failed, so cache was not saved");
    }

    return {
      stocks,
      isStale: false,
      fetchedAt,
      noData: stocks.length === 0,
    };
  })();

  try {
    return await stocksPromise;
  } finally {
    stocksPromise = null;
  }
}

 export async function refreshStocks(market = "us") {
  try {
    const stocks = market === "in" ? await fetchIndianStocks() : await fetchUSStocks();
    const fetchedAt = writeCache(market, stocks);
    return { stocks, isStale: false, fetchedAt, noData: false };
  } catch (error) {
    console.warn("Live refresh failed, keeping old data:", error.message);
    return null;
  }
}
export function simulateFetchFailure() {
  sessionStorage.setItem("forceFetchFailure", "true");
}
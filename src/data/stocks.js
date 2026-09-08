const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

const symbols = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "META",
  "TSLA",
  "NFLX",
  "AMD",
  "INTC",
  "JPM",
  "V",
  "MA",
  "WMT",
  "DIS",
  "KO",
  "PEP",
  "NKE",
  "ORCL",
  "ADBE"
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

export async function getStocks() {
  const savedStocks = sessionStorage.getItem("stocks");

  if (savedStocks) {
    console.log("Using cached stocks");
    return JSON.parse(savedStocks);

  }
  const stocks = [];

  for (const symbol of symbols) {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
    );
  if (!response.ok) {
      console.log("Failed:", symbol, response.status);
      continue;

    }
    const data = await response.json();

    stocks.push({
      symbol: symbol,
      sector: sectors[symbol],
      price: data.c,
      change: data.dp,
      highprice: data.h,
      lowprice: data.l,
      openprice: data.o
    });
  }
  sessionStorage.setItem("stocks", JSON.stringify(stocks));

  return stocks;
}
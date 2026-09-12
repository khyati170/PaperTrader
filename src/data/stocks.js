// const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

// const symbols = [
//   "AAPL",
//   "MSFT",
//   "GOOGL",
//   "AMZN",
//   "NVDA",
//   "META",
//   "TSLA",
//   "NFLX",
//   "AMD",
//   "INTC",
//   "JPM",
//   "V",
//   "MA",
//   "WMT",
//   "DIS",
//   "KO",
//   "PEP",
//   "NKE",
//   "ORCL",
//   "ADBE"
// ];

// const sectors = {
//   AAPL: "IT",
//   MSFT: "IT",
//   GOOGL: "IT",
//   AMZN: "IT",
//   NVDA: "IT",
//   META: "IT",
//   NFLX: "IT",
//   AMD: "IT",
//   INTC: "IT",
//   ORCL: "IT",
//   ADBE: "IT",

//   JPM: "Banking",
//   V: "Banking",
//   MA: "Banking",

//   TSLA: "Auto",

//   WMT: "Retail",
//   DIS: "Entertainment",
//   KO: "Food",
//   PEP: "Food",
//   NKE: "Retail"
// };

// export async function getStocks() {
//   const savedStocks = sessionStorage.getItem("stocks");

//   if (savedStocks) {
//     console.log("Using cached stocks");
//     return JSON.parse(savedStocks);

//   }
//   const stocks = [];

//   for (const symbol of symbols) {
//     const response = await fetch(
//       `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
//     );
//   if (!response.ok) {
//       console.log("Failed:", symbol, response.status);
//       continue;

//     }
//     const data = await response.json();

//     stocks.push({
//       symbol: symbol,
//       sector: sectors[symbol],
//       price: data.c,
//       change: data.dp,
//       highprice: data.h,
//       lowprice: data.l,
//       openprice: data.o
//     });
//   }
//   sessionStorage.setItem("stocks", JSON.stringify(stocks));

//   return stocks;
// }



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

export async function getStocks() {

  const savedStocks = sessionStorage.getItem("stocks");

  if (savedStocks) {
    const parsedStocks = JSON.parse(savedStocks);

    if (parsedStocks.length > 0) {
      console.log("Using cached stocks");
      return parsedStocks;
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
        console.log("Failed:", symbol, response.status);
        continue;
      }

      const data = await response.json();

      stocks.push({
        symbol: stockData.name,
        sector: sectors[symbol],
        price: data.c,
        change: data.dp,
        highprice: data.h,
        lowprice: data.l,
        openprice: data.o
      });
    }

    if (stocks.length === symbols.length) {
      sessionStorage.setItem("stocks", JSON.stringify(stocks));
      console.log("Stocks saved to sessionStorage");
    } else {
      console.log("Some stocks failed, so cache was not saved");
    }

    return stocks;
  })();

  return stocksPromise;
}
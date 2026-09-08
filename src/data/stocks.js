const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const symbols=[
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

export async function getStocks() {
    const stocks= [];
    for(const symbol of symbols){
        const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
    );
    const data = await response.json();
    stocks.push({
        symbol: symbol,
        price : data.c,
        change : data.dp,
        highprice : data.h,
        lowprice : data.l,
        openprice : data.o

    });

        
    }
    return stocks;

    
}

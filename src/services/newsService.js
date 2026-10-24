const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

/**

* Fetch recent news for one company.
* @param {string} symbol - Stock ticker, e.g. AAPL
* @param {number} days - Number of days to look back
  */
  export async function fetchCompanyNews(symbol, days = 7) {
  if (!API_KEY) {
  throw new Error("Finnhub API key is missing. Check your .env file.");
  }

const toDate = new Date();
const fromDate = new Date();

fromDate.setDate(fromDate.getDate() - days);

const formatDate = (date) => date.toISOString().slice(0, 10);

const params = new URLSearchParams({
symbol,
from: formatDate(fromDate),
to: formatDate(toDate),
token: API_KEY,
});

const response = await fetch(
`${BASE_URL}/company-news?${params.toString()}`
);

if (!response.ok) {
throw new Error(`Failed to fetch news for ${symbol}: ${response.status}`);
}

return response.json();
}

/**

* Fetch recent news for multiple companies.
  */
  export async function fetchPortfolioNews(symbols, days = 7) {
  const uniqueSymbols = [...new Set(symbols)];

const results = await Promise.allSettled(
uniqueSymbols.map(async (symbol) => {
const articles = await fetchCompanyNews(symbol, days);


  return articles.map((article) => ({
    ...article,
    stockSymbol: symbol,
  }));
})


);

const news = [];
const errors = [];

results.forEach((result, index) => {
if (result.status === "fulfilled") {
news.push(...result.value);
} else {
errors.push({
symbol: uniqueSymbols[index],
message: result.reason?.message || "Unable to fetch news",
});
}
});


news.sort((a, b) => b.datetime - a.datetime);

return { news, errors };
}

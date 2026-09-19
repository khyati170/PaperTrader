const lessons = [
  {
    emoji: "🏢",
    title: "What is a Stock?",
    body: [
      "A stock represents a small ownership share in a company. When a company needs money to grow, it can sell shares of ownership to investors.",
      "💡 Think of it like a pizza cut into 1,000 pieces. The whole pizza = the company. One slice = one share. Your slices = your ownership.",
      "Prices move because of company performance, news, investor demand, growth expectations, and overall market conditions.",
      "📌 On PaperTrader: when you see AAPL on the Market page, you're looking at Apple's publicly traded stock.",
    ],
  },
  {
    emoji: "🌅",
    title: "Opening Price",
    body: [
      "The opening price is the price at which a stock begins its regular trading session.",
      "Example: Apple opens at $235. During the day it moves $235 → $237 → $234 → $240. That first $235 is the opening price.",
      "🧠 Why care? If Open = $235 and Current = $240, the stock is $5 above where it started today.",
      "🔗 On your Market page, this is the 'Open' value on each StockCard.",
    ],
  },
  {
    emoji: "🌙",
    title: "Closing Price",
    body: [
      "The closing price is the stock's price at the end of the regular trading session.",
      "Example: Open → $235, during the day → $238 → $241 → $239, Close → $239.",
      "The previous day's closing price is commonly used as the reference point for calculating the day's price change.",
      "⚠️ Closing price ≠ current price. Closing belongs to a finished session; current price is the latest live price.",
    ],
  },
  {
    emoji: "💰",
    title: "Current Price",
    body: [
      "The current price is the latest available price of the stock — unlike open/close, it keeps changing while the market trades.",
      "Example: 10 AM $236 → 11 AM $238 → 12 PM $237 → 1 PM $240.",
      "🧠 Remember: Opening = where the day started · Current = where it is now · Closing = where the session ended.",
    ],
  },
  {
    emoji: "📈",
    title: "High & Low",
    body: [
      "High = the highest price reached during the trading period. Low = the lowest price reached during that period.",
      "Example: if Apple traded between $233 and $240, the day's range is $233 → $240.",
      "💡 Easy way to remember: High = highest point, Low = lowest point.",
    ],
  },
  {
    emoji: "🔄",
    title: "Price Change",
    body: [
      "This is the green/red number you see on a StockCard.",
      "Example: Previous Close = $235, Current = $240 → the price increased by $5, or +2.13%.",
      "🟢 Positive change: current price is higher than the previous close.",
      "🔴 Negative change: current price is lower than the previous close.",
    ],
  },
  {
    emoji: "📊",
    title: "Volume",
    body: [
      "Volume represents the number of shares traded during a particular period. Volume = 1,000,000 means 1 million shares changed hands.",
      "🧠 Important: volume is not the number of people who bought the stock — one share being bought and sold counts as trading activity, so it measures shares traded, not unique investors.",
      "Why look at it? Volume gives context to price movements — a big price move on high volume usually means stronger conviction behind it than the same move on low volume.",
    ],
  },
  {
    emoji: "🏦",
    title: "Market Cap",
    body: [
      "Market capitalization is an estimate of the total market value of a company's outstanding shares.",
      "Market Cap = Share Price × Shares Outstanding.",
      "Example: if a company has 10 million shares at $50 each, its market cap is $500 million.",
      "🧠 This means market cap moves for two reasons: the share price changes, or the company issues/buys back shares — not company size alone.",
    ],
  },
];
export default lessons;
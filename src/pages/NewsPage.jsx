import { useEffect, useMemo, useState } from "react";
import { fetchPortfolioNews } from "../services/newsService";
import "./NewsPage.css";

function formatDate(timestamp) {
if (!timestamp) return "Date unavailable";

return new Date(timestamp * 1000).toLocaleString("en-IN", {
day: "numeric",
month: "short",
year: "numeric",
hour: "2-digit",
minute: "2-digit",
});
}

function NewsPage({ holdings = {} }) {
const [news, setNews] = useState([]);
const [errors, setErrors] = useState([]);
const [selectedSymbol, setSelectedSymbol] = useState("ALL");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const symbols = useMemo(
() =>
Object.entries(holdings)
.filter(([, holding]) => Number(holding?.quantity) > 0)
.map(([symbol]) => symbol.toUpperCase()),
[holdings]
);

useEffect(() => {
let cancelled = false;


async function loadNews() {
  if (symbols.length === 0) {
    setNews([]);
    setErrors([]);
    setError("");
    setLoading(false);
    return;
  }

  setLoading(true);
  setError("");

  try {
    const result = await fetchPortfolioNews(symbols, 7);

    if (cancelled) return;

    setNews(result.news);
    setErrors(result.errors);

    if (result.news.length === 0 && result.errors.length > 0) {
      setError("Unable to load news. Please try again later.");
    }
  } catch (err) {
    if (!cancelled) {
      setError(err.message || "Something went wrong while loading news.");
    }
  } finally {
    if (!cancelled) setLoading(false);
  }
}

loadNews();

return () => {
  cancelled = true;
};


}, [symbols]);

const filteredNews = useMemo(() => {
const filtered =
selectedSymbol === "ALL"
? news
: news.filter((article) => article.stockSymbol === selectedSymbol);


return [...filtered].sort((a, b) => b.datetime - a.datetime);


}, [news, selectedSymbol]);

if (symbols.length === 0) {
return ( <main className="news-page"> <header className="news-header"> <p className="news-eyebrow">MARKET INTELLIGENCE</p> <h1>Financial News</h1> <p>Stay updated on the companies in your portfolio.</p> </header>


    <section className="news-empty">
      <div className="news-empty-icon">📰</div>
      <h2>Your portfolio is empty</h2>
      <p>
        Purchase a stock to see recent news about the companies you own.
      </p>
    </section>
  </main>
);


}

return ( <main className="news-page"> <header className="news-header"> <p className="news-eyebrow">MARKET INTELLIGENCE</p> <h1>Financial News</h1> <p>Stay informed about the companies in your portfolio.</p> </header>


  <section className="news-summary">
    <div>
      <span className="news-summary-label">YOUR PORTFOLIO</span>
      <h2>{symbols.length} {symbols.length === 1 ? "Company" : "Companies"}</h2>
    </div>

    <div>
      <span className="news-summary-label">ARTICLES FOUND</span>
      <h2>{news.length}</h2>
    </div>

    <button
      className="news-refresh"
      onClick={() => {
        window.location.reload();
      }}
      disabled={loading}
    >
      {loading ? "Loading..." : "↻ Refresh"}
    </button>
  </section>

  <nav className="news-filters" aria-label="Filter news by company">
    <button
      className={selectedSymbol === "ALL" ? "active" : ""}
      onClick={() => setSelectedSymbol("ALL")}
    >
      All News
    </button>

    {symbols.map((symbol) => (
      <button
        key={symbol}
        className={selectedSymbol === symbol ? "active" : ""}
        onClick={() => setSelectedSymbol(symbol)}
      >
        {symbol}
      </button>
    ))}
  </nav>

  {loading && (
    <div className="news-status" role="status">
      Fetching the latest news for your portfolio...
    </div>
  )}

  {error && (
    <div className="news-error" role="alert">
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>
        Try Again
      </button>
    </div>
  )}

  {!loading && !error && errors.length > 0 && (
    <div className="news-warning" role="status">
      Could not fetch news for:{" "}
      {errors.map((item) => item.symbol).join(", ")}.
      Other available articles are still displayed.
    </div>
  )}

  {!loading && !error && filteredNews.length === 0 && (
    <section className="news-empty">
      <h2>No recent articles found</h2>
      <p>
        There are no articles available for this selection in the last
        seven days.
      </p>
    </section>
  )}

  <section className="news-grid" aria-label="Company news">
    {filteredNews.map((article, index) => (
      <article
        className="news-card"
        key={`${article.stockSymbol}-${article.id ?? article.datetime}-${index}`}
      >
        {article.image && (
          <img
            className="news-image"
            src={article.image}
            alt=""
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}

        <div className="news-card-content">
          <div className="news-card-meta">
            <span className="news-symbol">{article.stockSymbol}</span>
            <span className="news-date">
              {formatDate(article.datetime)}
            </span>
          </div>

          <h2>{article.headline || "Untitled article"}</h2>

          <p className="news-description">
            {article.summary || "No summary is available for this article."}
          </p>

          <div className="news-card-footer">
            <span className="news-source">
              {article.source || "News source"}
            </span>

            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read Article ↗
              </a>
            )}
          </div>
        </div>
      </article>
    ))}
  </section>

  <footer className="news-disclaimer">
    News is provided for informational purposes only and does not
    constitute investment advice.
  </footer>
</main>


);
}

export default NewsPage;

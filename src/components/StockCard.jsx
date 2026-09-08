function StockCard({symbol,company,price,change}){
    return(
        <div className="stock-card">
            <div className="stock-heading">
                <h3>{symbol}</h3>
                <p>{company}</p>
                
            </div>

            <div className="stock-price">
                <p>Current Price{price}</p>
            </div>
            <div className={change >= 0 ? "positive" : "negative"}>
                {change >= 0 ? "+" : ""}{change}%
            </div>

            <div className="stock-action">
                <button className="view-stock">
                    View Stocks
                </button>
                <button className="watchlist">
                    WatchList
                </button>
            </div>
        </div>

        
    )
}
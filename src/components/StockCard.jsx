function StockCard({symbol,company,price,change,hp,lp,op}){
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
            <div className="prices">
                <div className="high-price">
                    <p>High Price: {hp}</p>
                </div>
                <div className="low-price">
                    <p>Low Price: {lp}</p>
                </div>
                <div className="open-price">
                    <p>Opening price: {op}</p>
                </div>
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
export default StockCard;
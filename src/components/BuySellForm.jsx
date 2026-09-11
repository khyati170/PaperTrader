
import { useState } from "react";

function BuySellForm({ stock, ownedShares, onBuy, onSell }) {
    const [quantity, setQuantity] = useState("");
    const qtyNumber = Number(quantity) || 0;
    const totalCost = qtyNumber * stock.price;

    const handleBuy = () => {
        if (qtyNumber <= 0) return;
        onBuy(stock, qtyNumber);
        setQuantity("");
    };

    const handleSell = () => {
        if (qtyNumber <= 0) return;
        onSell(stock, qtyNumber);
        setQuantity("");
    };

    return (
        <section className="trade-section">
            <div className="trade-panel">
                <h2>Buy {stock.symbol}</h2>
                <label htmlFor="buy-quantity">Quantity</label>
                <input
                    id="buy-quantity"
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                />
                <p>Total cost: ${totalCost.toFixed(2)}</p>
                <button className="buy-button" onClick={handleBuy}>Buy</button>
            </div>

            <div className="trade-panel">
                <h2>Sell {stock.symbol}</h2>
                <label htmlFor="sell-quantity">Quantity</label>
                <input
                    id="sell-quantity"
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                />
                <p>You own: {ownedShares} shares</p>
                <button className="sell-button" onClick={handleSell}>Sell</button>
            </div>
        </section>
    );
}

export default BuySellForm;
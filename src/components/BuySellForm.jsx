import { useState } from "react";

function BuySellForm({ stock, ownedShares, onBuy, onSell }) {
    const [buyQuantity, setBuyQuantity] = useState("");
    const [sellQuantity, setSellQuantity] = useState("");

    const buyQtyNumber = Number(buyQuantity) || 0;
    const totalCost = buyQtyNumber * stock.price;

    const handleBuy = () => {
        if (buyQtyNumber <= 0) return;
        onBuy(stock, buyQtyNumber);
        setBuyQuantity("");
    };

    const handleSell = () => {
        const sellQtyNumber = Number(sellQuantity) || 0;
        if (sellQtyNumber <= 0) return;
        onSell(stock, sellQtyNumber);
        setSellQuantity("");
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
                    value={buyQuantity}
                    onChange={(e) => setBuyQuantity(e.target.value)}
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
                    value={sellQuantity}
                    onChange={(e) => setSellQuantity(e.target.value)}
                />
                <p>You own: {ownedShares} shares</p>
                <button className="sell-button" onClick={handleSell}>Sell</button>
            </div>
        </section>
    );
}

export default BuySellForm;

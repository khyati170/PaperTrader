import { useState } from "react";
import Modal from "./Modal";

// Pure function: error string wapas deta hai, ya "" agar sab theek hai
const validateQuantity = (value, max, tooManyMessage) => {
    if (value === "") return "Enter a quantity";
    const qty = Number(value);
    if (!Number.isInteger(qty)) return "Quantity must be a whole number";
    if (qty <= 0) return "Quantity must be greater than 0";
    if (qty > max) return tooManyMessage;
    return "";
};

function BuySellForm({ stock, ownedShares, balance, onBuy, onSell }) {
    const [buyQuantity, setBuyQuantity] = useState("");
    const [sellQuantity, setSellQuantity] = useState("");
    const [buyError, setBuyError] = useState("");
    const [sellError, setSellError] = useState("");
    const [pending, setPending] = useState(null); // { type: "buy" | "sell", quantity }

    const price = stock.price || 0;
    const maxAffordable = price > 0 ? Math.floor(balance / price) : 0;
    const totalCost = (Number(buyQuantity) || 0) * price;

    const handleBuyClick = () => {
        const error = validateQuantity(
            buyQuantity, maxAffordable,
            `Not enough balance. You can afford at most ${maxAffordable} share(s)`
        );
        setBuyError(error);
        if (error) return;
        setPending({ type: "buy", quantity: Number(buyQuantity) });
    };

    const handleSellClick = () => {
        const error = validateQuantity(
            sellQuantity, ownedShares,
            ownedShares === 0
                ? `You don't own any shares of ${stock.symbol}`
                : `You own only ${ownedShares} share(s)`
        );
        setSellError(error);
        if (error) return;
        setPending({ type: "sell", quantity: Number(sellQuantity) });
    };

    // Modal mein "Confirm" dabane par asli buy/sell hota hai
    const handleConfirm = () => {
        if (pending.type === "buy") {
            onBuy(stock, pending.quantity);
            setBuyQuantity("");
        } else {
            onSell(stock, pending.quantity);
            setSellQuantity("");
        }
        setPending(null);
    };

    const pendingTotal = pending ? pending.quantity * price : 0;

    return (
        <section className="trade-section">
            <div className="trade-panel">
                <h2>Buy {stock.symbol}</h2>
                <label htmlFor="buy-quantity">Quantity</label>
                <input
                    id="buy-quantity" type="number" min="1" step="1"
                    className={buyError ? "input-error" : ""}
                    value={buyQuantity}
                    onChange={(e) => { setBuyQuantity(e.target.value); setBuyError(""); }}
                />
                {buyError && <p className="field-error">{buyError}</p>}
                <p>Total cost: ${totalCost.toFixed(2)}</p>
                <button className="buy-button" onClick={handleBuyClick}>Buy</button>
            </div>

            <div className="trade-panel">
                <h2>Sell {stock.symbol}</h2>
                <label htmlFor="sell-quantity">Quantity</label>
                <input
                    id="sell-quantity" type="number" min="1" step="1"
                    className={sellError ? "input-error" : ""}
                    value={sellQuantity}
                    onChange={(e) => { setSellQuantity(e.target.value); setSellError(""); }}
                />
                {sellError && <p className="field-error">{sellError}</p>}
                <p>You own: {ownedShares} shares</p>
                <button className="sell-button" onClick={handleSellClick}>Sell</button>
            </div>

            <Modal
                isOpen={pending !== null}
                title={pending?.type === "buy" ? "Confirm purchase" : "Confirm sale"}
                confirmText={pending?.type === "buy" ? "Yes, buy" : "Yes, sell"}
                confirmClass={pending?.type === "buy" ? "buy-button" : "sell-button"}
                onConfirm={handleConfirm}
                onCancel={() => setPending(null)}
            >
                {pending?.type === "buy"
                    ? `You are buying ${pending.quantity} share(s) of ${stock.symbol}. $${pendingTotal.toFixed(2)} will be deducted from your virtual wallet.`
                    : `You are selling ${pending?.quantity} share(s) of ${stock.symbol}. You will receive $${pendingTotal.toFixed(2)}.`}
            </Modal>
        </section>
    );
}

export default BuySellForm;
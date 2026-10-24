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

const usd = (n) =>
    `$${Number(n || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

function BuySellForm({ stock, ownedShares, balance, avgBuyPrice = 0, onBuy, onSell }) {
    const [buyQuantity, setBuyQuantity] = useState("");
    const [sellQuantity, setSellQuantity] = useState("");
    const [buyError, setBuyError] = useState("");
    const [sellError, setSellError] = useState("");
    const [pending, setPending] = useState(null); // { type: "buy" | "sell", quantity }

    const price = stock.price || 0;
    const maxAffordable = price > 0 ? Math.floor(balance / price) : 0;

    const buyQty = Number(buyQuantity) || 0;
    const sellQty = Number(sellQuantity) || 0;

    const totalCost = buyQty * price;
    const balanceAfter = balance - totalCost;
    const proceeds = sellQty * price;
    const saleProfit = (price - avgBuyPrice) * sellQty;

    // +/- buttons: 0 aur max ke beech rakho
    const stepQuantity = (current, delta, max, setter, clearError) => {
        const next = Math.max(0, Math.min(max, (Number(current) || 0) + delta));
        setter(next === 0 ? "" : String(next));
        clearError("");
    };

    // Chips: seedha value set karo (galat ho to validation error dikhayega)
    const setChip = (value, setter, clearError) => {
        setter(value > 0 ? String(value) : "");
        clearError("");
    };

    const handleBuyClick = () => {
        const error = validateQuantity(
            buyQuantity,
            maxAffordable,
            `Not enough balance. You can afford at most ${maxAffordable} share(s)`
        );
        setBuyError(error);
        if (error) return;
        setPending({ type: "buy", quantity: Number(buyQuantity) });
    };

    const handleSellClick = () => {
        const error = validateQuantity(
            sellQuantity,
            ownedShares,
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
    const halfOwned = Math.max(1, Math.floor(ownedShares / 2));

    return (
        <section className="trade-section">
            {/* ---------- BUY ---------- */}
            <div className="trade-panel">
                <h2>Buy {stock.symbol}</h2>
                <label htmlFor="buy-quantity">Quantity</label>

                <div className="qty-row">
                    <button
                        type="button"
                        className="qty-step"
                        aria-label="Decrease quantity"
                        onClick={() => stepQuantity(buyQuantity, -1, maxAffordable, setBuyQuantity, setBuyError)}
                    >
                        −
                    </button>
                    <input
                        id="buy-quantity"
                        type="number"
                        min="1"
                        step="1"
                        className={buyError ? "input-error" : ""}
                        value={buyQuantity}
                        onChange={(e) => {
                            setBuyQuantity(e.target.value);
                            setBuyError("");
                        }}
                    />
                    <button
                        type="button"
                        className="qty-step"
                        aria-label="Increase quantity"
                        onClick={() => stepQuantity(buyQuantity, 1, maxAffordable, setBuyQuantity, setBuyError)}
                    >
                        +
                    </button>
                </div>
                {buyError && <p className="field-error">{buyError}</p>}

                <div className="chip-row">
                    {[1, 5, 10].map((n) => (
                        <button key={n} type="button" className="qty-chip" onClick={() => setChip(n, setBuyQuantity, setBuyError)}>
                            {n}
                        </button>
                    ))}
                    <button type="button" className="qty-chip" onClick={() => setChip(maxAffordable, setBuyQuantity, setBuyError)}>
                        Max
                    </button>
                </div>

                <div className="trade-summary">
                    <div>
                        <span>Total to be deducted</span>
                        <b>{usd(totalCost)}</b>
                    </div>
                    <div>
                        <span>Balance after</span>
                        <b className={balanceAfter < 0 ? "text-loss" : ""}>{usd(balanceAfter)}</b>
                    </div>
                </div>

                <button className="buy-button" onClick={handleBuyClick}>Buy</button>
            </div>

            {/* ---------- SELL ---------- */}
            <div className="trade-panel">
                <h2>Sell {stock.symbol}</h2>
                <label htmlFor="sell-quantity">Quantity</label>

                <div className="qty-row">
                    <button
                        type="button"
                        className="qty-step"
                        aria-label="Decrease quantity"
                        onClick={() => stepQuantity(sellQuantity, -1, ownedShares, setSellQuantity, setSellError)}
                    >
                        −
                    </button>
                    <input
                        id="sell-quantity"
                        type="number"
                        min="1"
                        step="1"
                        className={sellError ? "input-error" : ""}
                        value={sellQuantity}
                        onChange={(e) => {
                            setSellQuantity(e.target.value);
                            setSellError("");
                        }}
                    />
                    <button
                        type="button"
                        className="qty-step"
                        aria-label="Increase quantity"
                        onClick={() => stepQuantity(sellQuantity, 1, ownedShares, setSellQuantity, setSellError)}
                    >
                        +
                    </button>
                </div>
                {sellError && <p className="field-error">{sellError}</p>}

                <div className="chip-row">
                    <button type="button" className="qty-chip" onClick={() => setChip(Math.min(1, ownedShares), setSellQuantity, setSellError)}>
                        1
                    </button>
                    <button type="button" className="qty-chip" onClick={() => setChip(ownedShares > 0 ? halfOwned : 0, setSellQuantity, setSellError)}>
                        Half
                    </button>
                    <button type="button" className="qty-chip" onClick={() => setChip(ownedShares, setSellQuantity, setSellError)}>
                        All
                    </button>
                </div>

                <div className="trade-summary">
                    <div>
                        <span>You will receive</span>
                        <b>{usd(proceeds)}</b>
                    </div>
                    <div>
                        <span>Profit on this sale</span>
                        <b className={saleProfit >= 0 ? "text-gain" : "text-loss"}>
                            {saleProfit >= 0 ? "+" : "-"}${Math.abs(saleProfit).toFixed(2)}
                        </b>
                    </div>
                    <div>
                        <span>You own</span>
                        <b>{ownedShares} shares</b>
                    </div>
                </div>

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
                    ? `You are buying ${pending.quantity} share(s) of ${stock.symbol}. ${usd(pendingTotal)} will be deducted from your virtual wallet.`
                    : `You are selling ${pending?.quantity} share(s) of ${stock.symbol}. You will receive ${usd(pendingTotal)}.`}
            </Modal>
        </section>
    );
}

export default BuySellForm;
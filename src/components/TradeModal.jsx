import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { isMarketOpen, getMarketStatusMessage } from "../config/marketConfig.js";

const usd = (n) =>
    `$${Number(n || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;


function TradeModal({
    isOpen, mode, stock, ownedShares = 0, avgBuyPrice = 0, balance = 0,
    onConfirm, onCancel,
}) {
    const [quantity, setQuantity] = useState("");
    const [error, setError] = useState("");

    // Har baar modal khulne par form reset
    useEffect(() => {
        if (isOpen) {
            setQuantity("");
            setError("");
        }
    }, [isOpen, mode, stock?.symbol]);

    // Escape dabane par band
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => { if (e.key === "Escape") onCancel(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onCancel]);

    if (!isOpen || !stock) return null;

    const isBuy = mode === "buy";
    const price = Number(stock.price) || 0;
    const maxQty = isBuy ? (price > 0 ? Math.floor(balance / price) : 0) : ownedShares;
    const qty = Number(quantity) || 0;

    const total = qty * price;
    const balanceAfter = balance - total;
    const profit = (price - avgBuyPrice) * qty;
    const halfOwned = Math.max(1, Math.floor(ownedShares / 2));

    const updateQuantity = (value) => {
        // sirf digits, max 6 digits (negative, ., e type hi nahi honge)
        setQuantity(value.replace(/\D/g, "").slice(0, 6));
        setError("");
    };

    const step = (delta) => {
        const next = Math.max(0, Math.min(maxQty, qty + delta));
        setQuantity(next === 0 ? "" : String(next));
        setError("");
    };

    const setChip = (value) => {
        setQuantity(value > 0 ? String(value) : "");
        setError("");
    };

    const validate = () => {
        if (!isMarketOpen()) return getMarketStatusMessage();
        if (!price) return "Price unavailable right now, try again in a moment.";
        if (quantity === "") return "Enter a quantity";
        if (qty <= 0) return "Quantity must be greater than 0";
        if (qty > maxQty) {
            if (isBuy) return `Not enough balance. You can afford at most ${maxQty} share(s)`;
            return ownedShares === 0
                ? `You don't own any shares of ${stock.symbol}`
                : `You own only ${ownedShares} share(s)`;
        }
        return "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const message = validate();
        setError(message);
        if (message) return;
        onConfirm(qty);
    };

    return createPortal(
        <div className="modal-overlay" onClick={onCancel}>
            <form
                className="modal-box trade-modal-box"
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
                noValidate
            >
                <div className="tm-header">
                    <h3>{isBuy ? "Buy" : "Sell"} {stock.symbol}</h3>
                    <span className="tm-price">{usd(price)} / share</span>
                </div>

                <label className="tm-label" htmlFor="tm-quantity">Quantity</label>
                <div className="qty-row">
                    <button type="button" className="qty-step" aria-label="Decrease quantity" onClick={() => step(-1)}>−</button>
                    <input
                        id="tm-quantity"
                        className={error ? "tm-input input-error" : "tm-input"}
                        type="text"
                        inputMode="numeric"
                        autoFocus
                        placeholder="0"
                        value={quantity}
                        onChange={(e) => updateQuantity(e.target.value)}
                    />
                    <button type="button" className="qty-step" aria-label="Increase quantity" onClick={() => step(1)}>+</button>
                </div>
                {error && <p className="tm-error">{error}</p>}

                <div className="chip-row">
                    {isBuy ? (
                        <>
                            {[1, 5, 10].map((n) => (
                                <button key={n} type="button" className="qty-chip" onClick={() => setChip(n)}>{n}</button>
                            ))}
                            <button type="button" className="qty-chip" onClick={() => setChip(maxQty)}>Max</button>
                        </>
                    ) : (
                        <>
                            <button type="button" className="qty-chip" onClick={() => setChip(Math.min(1, ownedShares))}>1</button>
                            <button type="button" className="qty-chip" onClick={() => setChip(ownedShares > 0 ? halfOwned : 0)}>Half</button>
                            <button type="button" className="qty-chip" onClick={() => setChip(ownedShares)}>All</button>
                        </>
                    )}
                </div>

                <div className="trade-summary">
                    {isBuy ? (
                        <>
                            <div><span>Total to be deducted</span><b>{usd(total)}</b></div>
                            <div>
                                <span>Balance after</span>
                                <b className={balanceAfter < 0 ? "text-loss" : ""}>{usd(balanceAfter)}</b>
                            </div>
                        </>
                    ) : (
                        <>
                            <div><span>You will receive</span><b>{usd(total)}</b></div>
                            <div>
                                <span>Profit on this sale</span>
                                <b className={profit >= 0 ? "text-gain" : "text-loss"}>
                                    {profit >= 0 ? "+" : "-"}${Math.abs(profit).toFixed(2)}
                                </b>
                            </div>
                            <div><span>You own</span><b>{ownedShares} shares</b></div>
                        </>
                    )}
                </div>

                <div className="modal-actions">
                    <button type="button" className="modal-cancel" onClick={onCancel}>Cancel</button>
                    <button type="submit" className={isBuy ? "buy-button" : "sell-button"}>
                        {isBuy ? "Confirm Buy" : "Confirm Sell"}
                    </button>
                </div>
            </form>
        </div>,
        document.body
    );
}

export default TradeModal;
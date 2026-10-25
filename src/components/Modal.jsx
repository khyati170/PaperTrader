import { useEffect } from "react";
import { createPortal } from "react-dom";

function Modal({
    isOpen, title, children, onConfirm, onCancel,
    confirmText = "Confirm", cancelText = "Cancel", confirmClass = "buy-button",
}) {

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => { if (e.key === "Escape") onCancel(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h3>{title}</h3>
                <div className="modal-body">{children}</div>
                <div className="modal-actions">
                    <button className="modal-cancel" onClick={onCancel}>{cancelText}</button>
                    <button className={confirmClass} onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default Modal;
export default function SkeletonCard() {
  return (
    <div className="stock-card skeleton-card">
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-line skeleton-subtitle"></div>
      <div className="skeleton-line skeleton-price"></div>
      <div className="skeleton-line skeleton-change"></div>
      <div className="prices">
        <div className="skeleton-line skeleton-mini"></div>
        <div className="skeleton-line skeleton-mini"></div>
        <div className="skeleton-line skeleton-mini"></div>
      </div>
      <div className="stock-action">
        <div className="skeleton-btn"></div>
        <div className="skeleton-btn"></div>
      </div>
    </div>
  );
}
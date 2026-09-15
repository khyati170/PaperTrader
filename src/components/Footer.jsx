import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-logo">Paper Trader</span>
          <p className="footer-tagline">Practice investing. Real prices. Zero risk.</p>
        </div>

        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/market">Market</Link>
          <Link to="/watchlist">Watchlist</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Paper Trader — College Capstone Project</p>
      </div>
    </footer>
  );
}

export default Footer;
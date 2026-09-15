import { Link } from "react-router-dom";

function FinalCTA() {
  return (
    <section className="final-cta">
      <h2>Start Your Investing Journey Today</h2>
      <p>No risk. Real market data. Learn by doing.</p>
      <Link to="/market" className="cta-btn">
        Explore the Market
      </Link>
    </section>
  );
}

export default FinalCTA;
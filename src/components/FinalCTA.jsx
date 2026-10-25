import { Link } from "react-router-dom";

function FinalCta() {
  return (
    <section className="final-cta">
      <div className="cta-banner">
        <div className="cta-copy">
          <h2>Your first trade is one click away.</h2>
          <p>Join with $100,000 in virtual cash and start learning on real market prices.</p>
        </div>

        <div className="cta-actions">
          <Link to="/login?mode=signup" className="cta-primary">Create free account</Link>
          <Link to="/market" className="cta-secondary">Browse stocks</Link>
        </div>
      </div>
    </section>
  );
}

export default FinalCta;
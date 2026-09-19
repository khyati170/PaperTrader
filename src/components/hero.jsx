import { Link } from "react-router-dom";
function Hero({ isAuthenticated }) {
  return (
    <div className="pic">
      <div className="overlay">
        <div className="content">
          <h1>Paper Trader</h1>
          <h2>making you a better trader</h2>
            <Link
              to={isAuthenticated ? "/market" : "/login"}
              className="cta-btn"
              >
            Start Trading
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Hero;
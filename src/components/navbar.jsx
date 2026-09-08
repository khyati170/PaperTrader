import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bar">
      <div className="logo">
        <Link to="/">Paper Trader</Link>
      </div>

      <div className="links">
        <Link to="/">Home</Link>
        <Link to="/market">Market</Link>
        <Link to="#">Portfolio</Link>
        <Link to="#">WatchList</Link>
      </div>
    </nav>
  );
}

export default Navbar;
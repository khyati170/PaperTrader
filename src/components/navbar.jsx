import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
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
        <Link to="/watchlist">WatchList</Link>
      </div>
      <ThemeToggle/>
    </nav>
  );
}

export default Navbar;
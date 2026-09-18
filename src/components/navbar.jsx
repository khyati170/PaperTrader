
import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

function Navbar({ isAuthenticated, balance, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bar">
      <div className="logo">
        <span className="logo-mark">↗</span>

        <NavLink
          to="/"
          onClick={() => setMenuOpen(false)}
        >
          PaperTrader
        </NavLink>
      </div>

      <div className={`links ${menuOpen ? "links-open" : ""}`}>
        <NavLink
          to="/"
          end
          onClick={() => setMenuOpen(false)}
        >
          Home
        </NavLink>

        <NavLink
          to="/market"
          onClick={() => setMenuOpen(false)}
        >
          Market
        </NavLink>

        <NavLink
          to="/portfolio"
          onClick={() => setMenuOpen(false)}
        >
          Portfolio
        </NavLink>

        <NavLink
          to="/watchlist"
          onClick={() => setMenuOpen(false)}
        >
          Watchlist
        </NavLink>
      </div>

      <div className="navbar-actions">
        {isAuthenticated ? (
          <>
            <span className="balance-pill">
              <span className="balance-label">Balance</span>
              <span>${balance?.toFixed(2)}</span>
            </span>

            <button
              className="logout-button"
              onClick={onLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="login-btn"
          >
            Login
          </Link>
        )}

        <ThemeToggle />
      </div>

      <button
        className={`menu-toggle ${menuOpen ? "menu-open" : ""}`}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
}

export default Navbar;


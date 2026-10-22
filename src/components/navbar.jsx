import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import Modal from "./Modal";
import { useToast } from "../context/ToastContext";

function Navbar({ isAuthenticated, balance, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogoutClick = () => {
    setMenuOpen(false);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
    showToast("You have been logged out.", "info");
    navigate("/login", { replace: true });
  };

  return (
    <nav className="bar">
      <div className="logo">
        <span className="logo-mark">↗</span>

        <NavLink to="/" onClick={() => setMenuOpen(false)}>
          PaperTrader
        </NavLink>
      </div>

      <div className={`links ${menuOpen ? "links-open" : ""}`}>
        <NavLink to="/" end onClick={() => setMenuOpen(false)}>
          Home
        </NavLink>

        <NavLink to="/market" onClick={() => setMenuOpen(false)}>
          Market
        </NavLink>

        <NavLink to="/portfolio" onClick={() => setMenuOpen(false)}>
          Portfolio
        </NavLink>

        <NavLink to="/watchlist" onClick={() => setMenuOpen(false)}>
          Watchlist
        </NavLink>

        <NavLink to="/lessons" onClick={() => setMenuOpen(false)}>
          Learn
        </NavLink>
      </div>

      <div className="navbar-actions">
        {isAuthenticated ? (
          <>
            <span className="balance-pill">
              <span className="balance-label">Balance</span>
              <span>${balance?.toFixed(2)}</span>
            </span>

            <button className="logout-button" onClick={handleLogoutClick}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="login-btn">
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

      <Modal
        isOpen={showLogoutModal}
        title="Log out?"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        confirmText="Yes, Log Out"
        cancelText="Stay Logged In"
      >
        <p>Are you sure you want to log out?</p>
      </Modal>
    </nav>
  );
}

export default Navbar;
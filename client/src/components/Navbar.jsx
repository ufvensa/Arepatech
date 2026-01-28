import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ufLogo from "../images/VENSA Website UF Logo.png";
import vensaLogo from "../images/VENSA Website Logo.png";

export default function Navbar() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo-group" onClick={closeMobileMenu}>
          <img
            src={ufLogo}
            alt="UF Logo"
            className="navbar-logo-uf"
          />
          <div className="navbar-divider"></div>
          <div className="navbar-logo-text">
            <div className="navbar-text-top">Venezuelan</div>
            <div className="navbar-text-bottom">Student Association</div>
          </div>
          <img
            src={vensaLogo}
            alt="VENSA Logo"
            className="navbar-logo-vensa"
          />
        </Link>

        <button
          className="navbar-mobile-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </span>
        </button>

        <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/about" className="navbar-link" onClick={closeMobileMenu}>About</NavLink>
          <span className="navbar-separator">|</span>
          <NavLink to="/events" className="navbar-link" onClick={closeMobileMenu}>Events</NavLink>
          <span className="navbar-separator">|</span>
          <NavLink to="/get-involved" className="navbar-link" onClick={closeMobileMenu}>Get Involved</NavLink>
          <span className="navbar-separator">|</span>
          <NavLink to="/resources" className="navbar-link" onClick={closeMobileMenu}>Resources</NavLink>

          <NavLink to="/profile" className="navbar-profile" onClick={closeMobileMenu}>
            {isLoggedIn ? "Profile" : "Sign In"}
          </NavLink>
        </div>

        {mobileMenuOpen && <div className="navbar-mobile-overlay" onClick={closeMobileMenu}></div>}
      </div>
    </nav>
  );
}
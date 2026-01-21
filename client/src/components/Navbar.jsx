import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import ufLogo from "../images/VENSA Website UF Logo.png";
import vensaLogo from "../images/Vensa Website logo.png";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check login status on mount
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    // Listen for storage changes
    const handleStorageChange = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(loggedIn);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setShowDropdown(false);
    navigate("/profile");
  };

  const handleProfileClick = (e) => {
    if (isLoggedIn) {
      e.preventDefault();
      setShowDropdown(!showDropdown);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo-group">
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

        <div className="navbar-links">
          <NavLink to="/about" className="navbar-link">About</NavLink>
          <span className="navbar-separator">|</span>
          <NavLink to="/events" className="navbar-link">Events</NavLink>
          <span className="navbar-separator">|</span>
          <NavLink to="/get-involved" className="navbar-link">Get Involved</NavLink>
          <span className="navbar-separator">|</span>
          <NavLink to="/resources" className="navbar-link">Resources</NavLink>
          
          <div className="navbar-profile-container" ref={dropdownRef}>
            <NavLink 
              to="/profile" 
              className="navbar-profile"
              onClick={handleProfileClick}
            >
              {isLoggedIn ? "Profile" : "Sign In"}
            </NavLink>
            
            {isLoggedIn && showDropdown && (
              <div className="navbar-dropdown">
                <button onClick={handleLogout} className="navbar-dropdown-item">
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
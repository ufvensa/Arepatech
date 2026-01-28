import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ufLogo from "../images/VENSA Website UF Logo.png";
import vensaLogo from "../images/VENSA Website Logo.png";

export default function Navbar() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

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
          
          <NavLink to="/profile" className="navbar-profile">
            {isLoggedIn ? "Profile" : "Sign In"}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
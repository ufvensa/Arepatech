import { Link } from "react-router-dom";
import ufLogo from "../images/VENSA Website UF Logo.png";
import vensaLogo from "../images/Vensa Website logo.png";

export default function Navbar() {
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
          <Link to="/about" className="navbar-link">About</Link>
          <span className="navbar-separator">|</span>
          <Link to="/events" className="navbar-link">Events</Link>
          <span className="navbar-separator">|</span>
          <Link to="/get-involved" className="navbar-link">Get Involved</Link>
          <span className="navbar-separator">|</span>
          <Link to="/resources" className="navbar-link">Resources</Link>
          <Link to="/profile" className="navbar-profile">Profile</Link>
        </div>
      </div>
    </nav>
  );
}
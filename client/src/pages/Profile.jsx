import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ufLogo from "../images/VENSA Website UF Logo.png";
import vensaLogo from "../images/Vensa Website logo.png";
import instagramIcon from "../images/Vensa Website Instagram.png";
import facebookIcon from "../images/Vensa Website Facebook.png";
import pinIcon from "../images/Vensa Website Pin.png";
import linkedinIcon from "../images/Vensa Website Linkedin.png";

export default function Profile() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Set login state in localStorage
    localStorage.setItem("isLoggedIn", "true");
    // Redirect to home page
    navigate("/");
    // Trigger storage event for navbar update
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="profile-page">
      {/* Login Form Section */}
      <section className="profile-content">
        <div className="profile-container">
          <div className="profile-form-card">
            <h1 className="profile-title">Welcome Back!!</h1>
            <p className="profile-subtitle">Sign in to continue to your UF VENSA Account and get access to all the member exclusive items on our website!</p>
            
            <form onSubmit={handleLogin} className="profile-form">
              <div className="profile-form-group">
                <label htmlFor="email" className="profile-label">Username/Email</label>
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Username/Email"
                  className="profile-input"
                  required
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="password" className="profile-label">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="profile-input"
                  required
                />
              </div>

              <div className="profile-form-options">
                <label className="profile-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="profile-checkbox"
                  />
                  <span>Remember me</span>
                </label>
                <Link to="#" className="profile-forgot">Forgot Password?</Link>
              </div>

              <button type="submit" className="profile-login-button">
                Log In
              </button>

              <div className="profile-divider">
                <span>or</span>
              </div>

              <p className="profile-signup">
                New to VENSA? <Link to="/signup" className="profile-signup-link">Click here to create an account</Link>
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-main-container">
          <div className="footer-content">
            <Link to="/" className="footer-logo-group">
              <img 
                src={ufLogo} 
                alt="UF Logo"
                className="footer-logo-uf"
              />
              <div className="footer-divider"></div>
              <div className="footer-logo-text">
                <div className="footer-text-top">Venezuelan</div>
                <div className="footer-text-bottom">Student Association</div>
              </div>
              <img 
                src={vensaLogo} 
                alt="VENSA Logo"
                className="footer-logo-vensa"
              />
            </Link>

            <div className="footer-right">
              <div className="footer-social">
                <a 
                  href="https://www.instagram.com/ufvensa/?hl=en" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-item"
                >
                  <img src={instagramIcon} alt="Instagram" className="social-icon" />
                  <span>@ufvensa</span>
                </a>
                <a 
                  href="https://www.facebook.com/uf.vensa/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-item"
                >
                  <img src={facebookIcon} alt="Facebook" className="social-icon" />
                  <span>@ufvensa</span>
                </a>
              </div>

              <div className="footer-contact">
                <a 
                  href="https://www.google.com/maps/place/University+of+Florida/@29.6464959,-82.3557957,16.11z/data=!4m6!3m5!1s0x88e8a30cfbe49275:0x206fe0de143d9886!8m2!3d29.6465428!4d-82.3533266!16s%2Fm%2F0j_sncb?entry=ttu&g_ep=EgoyMDI1MTExNy4wIKXMDSoASAFQAw%3D%3D" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="contact-item"
                >
                  <img src={pinIcon} alt="Location" className="contact-icon" />
                  <span>University of Florida • Gainesville, FL</span>
                </a>
                <a 
                  href="https://www.linkedin.com/company/ufvensa" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="contact-item"
                >
                  <img src={linkedinIcon} alt="LinkedIn" className="contact-icon" />
                  <span>Venezuelan Student Association at<br />the University of Florida</span>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-copyright">
            © Copyright 2026. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
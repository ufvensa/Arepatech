import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ufLogo from "../images/VENSA Website UF Logo.png";
import vensaLogo from "../images/Vensa Website logo.png";
import instagramIcon from "../images/Vensa Website Instagram.png";
import facebookIcon from "../images/Vensa Website Facebook.png";
import pinIcon from "../images/Vensa Website Pin.png";
import linkedinIcon from "../images/Vensa Website Linkedin.png";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();
    // Set login state in localStorage
    localStorage.setItem("isLoggedIn", "true");
    // Redirect to home page
    navigate("/");
    // Trigger storage event for navbar update
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="signup-page">
      {/* Sign Up Form Section */}
      <section className="signup-content">
        <div className="signup-container">
          <div className="signup-form-card">
            <h1 className="signup-title">Welcome!</h1>
            <p className="signup-subtitle">Sign up to create your UF VENSA Account and join our community!</p>
            
            <form onSubmit={handleSignUp} className="signup-form">
              <div className="signup-form-group">
                <label htmlFor="firstName" className="signup-label">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter First Name"
                  className="signup-input"
                  required
                />
              </div>

              <div className="signup-form-group">
                <label htmlFor="lastName" className="signup-label">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter Last Name"
                  className="signup-input"
                  required
                />
              </div>

              <div className="signup-form-group">
                <label htmlFor="dateOfBirth" className="signup-label">Date of Birth</label>
                <input
                  type="text"
                  id="dateOfBirth"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  placeholder="Enter Date of Birth MM/DD/YYYY"
                  className="signup-input"
                  required
                />
              </div>

              <div className="signup-form-group">
                <label htmlFor="major" className="signup-label">Major</label>
                <input
                  type="text"
                  id="major"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="Enter Major"
                  className="signup-input"
                  required
                />
              </div>

              <div className="signup-form-group">
                <label htmlFor="year" className="signup-label">Year</label>
                <select
                  id="year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="signup-input signup-select"
                  required
                >
                  <option value="">Select Year</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>

              <div className="signup-form-group">
                <label htmlFor="email" className="signup-label">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  className="signup-input"
                  required
                />
              </div>

              <div className="signup-form-group">
                <label htmlFor="username" className="signup-label">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Username"
                  className="signup-input"
                  required
                />
              </div>

              <div className="signup-form-group">
                <label htmlFor="password" className="signup-label">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="signup-input"
                  required
                />
              </div>

              <div className="signup-form-group">
                <label htmlFor="confirmPassword" className="signup-label">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Your Password"
                  className="signup-input"
                  required
                />
              </div>

              <div className="signup-form-options">
                <label className="signup-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="signup-checkbox"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              <button type="submit" className="signup-button">
                Sign Up
              </button>

              <div className="signup-divider">
                <span>or</span>
              </div>

              <p className="signup-login">
                Already a VENSA Member? <Link to="/profile" className="signup-login-link">Click here to login</Link>
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

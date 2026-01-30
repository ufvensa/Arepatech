import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ufLogo from "../images/VENSA Website UF Logo.png";
import vensaLogo from "../images/VENSA Website Logo.png";
import instagramIcon from "../images/VENSA Website Instagram.png";
import facebookIcon from "../images/VENSA Website Facebook.png";
import pinIcon from "../images/VENSA Website Pin.png";
import linkedinIcon from "../images/VENSA Website LinkedIn.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setMessage("Password reset email sent! Check your inbox.");
        setEmailSent(true);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <section className="profile-content">
        <div className="profile-container">
          {!emailSent ? (
            <div className="profile-login-card">
              <h1 className="profile-login-title">Forgot Password</h1>
              <p className="profile-login-subtitle">
                Enter your email address and we'll send you a link to reset your password
              </p>

              <form onSubmit={handleResetPassword} className="profile-login-form">
                {error && (
                  <div className="profile-error-banner">
                    {error}
                  </div>
                )}

                <div className="profile-field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@ufl.edu"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="profile-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="profile-divider">
                  <span>or</span>
                </div>

                <p className="profile-signup-prompt">
                  Remember your password?{" "}
                  <Link to="/profile" className="profile-signup-link">
                    Sign In
                  </Link>
                </p>
              </form>
            </div>
          ) : (
            <div className="profile-login-card">
              <h1 className="profile-login-title">Check Your Email</h1>
              <p className="profile-login-subtitle">
                We've sent a password reset link to <strong>{email}</strong>
              </p>

              <div className="profile-login-form">
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '0.5rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  {message}
                </div>

                <p style={{ 
                  color: '#d1d5db', 
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  lineHeight: '1.6'
                }}>
                  Click the link in the email to reset your password. If you don't see it, check your spam folder.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setEmailSent(false);
                    setMessage("");
                    setEmail("");
                  }}
                  className="profile-submit-btn"
                  style={{ backgroundColor: '#374151' }}
                >
                  Try Again
                </button>

                <div className="profile-divider">
                  <span>or</span>
                </div>

                <p className="profile-signup-prompt">
                  <Link to="/profile" className="profile-signup-link">
                    Return to Sign In
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-main-container">
          <div className="footer-content">
            <Link to="/" className="footer-logo-group">
              <img src={ufLogo} alt="UF Logo" className="footer-logo-uf" />
              <div className="footer-divider"></div>
              <div className="footer-logo-text">
                <div className="footer-text-top">Venezuelan</div>
                <div className="footer-text-bottom">Student Association</div>
              </div>
              <img src={vensaLogo} alt="VENSA Logo" className="footer-logo-vensa" />
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
                  href="https://www.google.com/maps/place/University+of+Florida"
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
                  <span>
                    Venezuelan Student Association at
                    <br />
                    the University of Florida
                  </span>
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

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ufLogo from "../images/VENSA Website UF Logo.png";
import vensaLogo from "../images/Vensa Website logo.png";
import instagramIcon from "../images/Vensa Website Instagram.png";
import facebookIcon from "../images/Vensa Website Facebook.png";
import pinIcon from "../images/Vensa Website Pin.png";
import linkedinIcon from "../images/Vensa Website Linkedin.png";

// User Profile Display Component (shown when logged in)
function UserProfileView({ profile, onLogout }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "eboard": return "#1e3a8a";
      case "member": return "#059669";
      case "alumni": return "#7c3aed";
      default: return "#6b7280";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "eboard": return "E-Board";
      case "member": return "Member";
      case "alumni": return "Alumni";
      default: return "Member";
    }
  };

  return (
    <div className="profile-form-card" style={{ textAlign: 'center' }}>
      <div style={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: '#e5e7eb',
        margin: '0 auto 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <img src={vensaLogo} alt="VENSA" style={{ width: '60px', height: '60px' }} />
        )}
      </div>

      <h1 className="profile-title" style={{ color: '#1f2937' }}>
        {profile?.first_name} {profile?.last_name}
      </h1>

      <span style={{
        display: 'inline-block',
        backgroundColor: getStatusColor(profile?.status),
        color: 'white',
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '20px'
      }}>
        {getStatusLabel(profile?.status)}
      </span>

      <div style={{ textAlign: 'left', marginBottom: '24px' }}>
        <div style={{ marginBottom: '12px' }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>Username</span>
          <p style={{ margin: '4px 0 0', fontWeight: '500', color: '#1f2937' }}>{profile?.username ? `@${profile.username}` : 'Not set'}</p>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>Email</span>
          <p style={{ margin: '4px 0 0', fontWeight: '500', color: '#1f2937' }}>{profile?.email || 'Not set'}</p>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>Major</span>
          <p style={{ margin: '4px 0 0', fontWeight: '500', color: '#1f2937' }}>{profile?.major || 'Not set'}</p>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>Year</span>
          <p style={{ margin: '4px 0 0', fontWeight: '500', color: '#1f2937' }}>{profile?.year || 'Not set'}</p>
        </div>
        {profile?.workplace && (
          <div style={{ marginBottom: '12px' }}>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>Workplace</span>
            <p style={{ margin: '4px 0 0', fontWeight: '500', color: '#1f2937' }}>{profile.workplace}</p>
          </div>
        )}
        <div style={{ marginBottom: '12px' }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>Attendance Rate</span>
          <p style={{ margin: '4px 0 0', fontWeight: '500', color: '#1f2937' }}>{profile?.attendance_rate ?? 0}%</p>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="profile-login-button"
        style={{ backgroundColor: '#dc2626' }}
      >
        Log Out
      </button>
    </div>
  );
}

export default function Profile() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user, profile, signIn, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: signInError } = await signIn({ email, password });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      navigate("/");
    } catch (err) {
      setError(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Show loading state
  if (loading) {
    return (
      <div className="profile-page">
        <section className="profile-content">
          <div className="profile-container">
            <div className="profile-form-card" style={{ textAlign: 'center', padding: '60px' }}>
              <p>Loading...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // User is logged in but profile might still be loading or missing
  if (user && !profile) {
    return (
      <div className="profile-page">
        <section className="profile-content">
          <div className="profile-container">
            <div className="profile-form-card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: '#e5e7eb',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img src={vensaLogo} alt="VENSA" style={{ width: '60px', height: '60px' }} />
              </div>
              <h1 className="profile-title">Welcome!</h1>
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                Logged in as: {user.email}
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
                Your profile is being set up. If this persists, please try logging out and back in.
              </p>
              <button
                onClick={handleLogout}
                className="profile-login-button"
                style={{ backgroundColor: '#dc2626' }}
              >
                Log Out
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Show Profile if logged in, otherwise show Login Form */}
      <section className="profile-content">
        <div className="profile-container">
          {user && profile ? (
            <UserProfileView profile={profile} onLogout={handleLogout} />
          ) : (
            <div className="profile-form-card">
              <h1 className="profile-title">Welcome Back!!</h1>
              <p className="profile-subtitle">Sign in to continue to your UF VENSA Account and get access to all the member exclusive items on our website!</p>

              <form onSubmit={handleLogin} className="profile-form">
                {error && (
                  <div style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #ef4444',
                    color: '#dc2626',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '14px'
                  }}>
                    {error}
                  </div>
                )}

                <div className="profile-form-group">
                  <label htmlFor="email" className="profile-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@ufl.edu"
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

                <button
                  type="submit"
                  className="profile-login-button"
                  disabled={isLoading}
                  style={isLoading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                >
                  {isLoading ? "Logging in..." : "Log In"}
                </button>

                <div className="profile-divider">
                  <span>or</span>
                </div>

                <p className="profile-signup">
                  New to VENSA? <Link to="/signup" className="profile-signup-link">Click here to create an account</Link>
                </p>
              </form>
            </div>
          )}
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
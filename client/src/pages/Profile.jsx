import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../lib/supabase";
import ufLogo from "../images/VENSA Website UF Logo.png";
import vensaLogo from "../images/Vensa Website logo.png";
import instagramIcon from "../images/Vensa Website Instagram.png";
import facebookIcon from "../images/Vensa Website Facebook.png";
import pinIcon from "../images/Vensa Website Pin.png";
import linkedinIcon from "../images/Vensa Website Linkedin.png";

// Edit Profile Form Component
function EditProfileForm({ profile, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    major: profile?.major || "",
    year: profile?.year || "",
    workplace: profile?.workplace || "",
    bio: profile?.bio || "",
    linkedin_url: profile?.linkedin_url || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await onSave(formData);
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-edit-form">
      {error && (
        <div className="profile-error-banner">
          {error}
        </div>
      )}

      <div className="profile-edit-grid">
        <div className="profile-edit-field">
          <label>First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="profile-edit-field">
          <label>Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="profile-edit-field">
          <label>Major</label>
          <input
            type="text"
            name="major"
            value={formData.major}
            onChange={handleChange}
            placeholder="e.g. Computer Science"
          />
        </div>

        <div className="profile-edit-field">
          <label>Year</label>
          <select name="year" value={formData.year} onChange={handleChange}>
            <option value="">Select Year</option>
            <option value="Freshman">Freshman</option>
            <option value="Sophomore">Sophomore</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
            <option value="Graduate">Graduate</option>
            <option value="Alumni">Alumni</option>
          </select>
        </div>

        <div className="profile-edit-field">
          <label>Workplace</label>
          <input
            type="text"
            name="workplace"
            value={formData.workplace}
            onChange={handleChange}
            placeholder="Company or organization"
          />
        </div>

        <div className="profile-edit-field">
          <label>LinkedIn URL</label>
          <input
            type="url"
            name="linkedin_url"
            value={formData.linkedin_url}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        <div className="profile-edit-field profile-edit-field-full">
          <label>Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows={4}
          />
        </div>
      </div>

      <div className="profile-edit-actions">
        <button type="button" onClick={onCancel} className="profile-btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="profile-btn-primary">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

// User Profile Display Component (shown when logged in)
function UserProfileView({ profile, onEdit, onLogout }) {
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

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="profile-modern-card">
      {/* Header Section */}
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder">
              <span>{profile?.first_name?.[0]}{profile?.last_name?.[0]}</span>
            </div>
          )}
        </div>

        <div className="profile-header-info">
          <h1 className="profile-name">
            {profile?.first_name} {profile?.last_name}
          </h1>
          <p className="profile-username">@{profile?.username}</p>
          <span
            className="profile-status-badge"
            style={{ backgroundColor: getStatusColor(profile?.status) }}
          >
            {getStatusLabel(profile?.status)}
          </span>
        </div>

        <button onClick={onEdit} className="profile-edit-btn">
          Edit Profile
        </button>
      </div>

      {/* Bio Section */}
      {profile?.bio && (
        <div className="profile-section">
          <p className="profile-bio">{profile.bio}</p>
        </div>
      )}

      {/* Info Grid */}
      <div className="profile-info-grid">
        <div className="profile-info-item">
          <span className="profile-info-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
              <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
            </svg>
          </span>
          <div>
            <span className="profile-info-label">Email</span>
            <span className="profile-info-value">{profile?.email || 'Not set'}</span>
          </div>
        </div>

        <div className="profile-info-item">
          <span className="profile-info-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
              <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
              <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
            </svg>
          </span>
          <div>
            <span className="profile-info-label">Major</span>
            <span className="profile-info-value">{profile?.major || 'Not set'}</span>
          </div>
        </div>

        <div className="profile-info-item">
          <span className="profile-info-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
            </svg>
          </span>
          <div>
            <span className="profile-info-label">Year</span>
            <span className="profile-info-value">{profile?.year || 'Not set'}</span>
          </div>
        </div>

        <div className="profile-info-item">
          <span className="profile-info-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 000-1.5h-15zM9 6a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm-.75 3.75A.75.75 0 019 9h1.5a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM9 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm3.75-5.25A.75.75 0 0113.5 6H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM13.5 9a.75.75 0 000 1.5H15A.75.75 0 0015 9h-1.5zm-.75 3.75a.75.75 0 01.75-.75H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM9 19.5v-2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5A.75.75 0 019 19.5z" clipRule="evenodd" />
            </svg>
          </span>
          <div>
            <span className="profile-info-label">Workplace</span>
            <span className="profile-info-value">{profile?.workplace || 'Not set'}</span>
          </div>
        </div>

        {profile?.date_of_birth && (
          <div className="profile-info-item">
            <span className="profile-info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M15 1.784l-.796.796a1.125 1.125 0 101.591 0L15 1.784zM12 1.784l-.796.796a1.125 1.125 0 101.591 0L12 1.784zM9 1.784l-.796.796a1.125 1.125 0 101.591 0L9 1.784zM9.75 7.547c.498-.02.998-.035 1.5-.042V6.75a.75.75 0 011.5 0v.755c.502.007 1.002.021 1.5.042V6.75a.75.75 0 011.5 0v.88l.307.022c1.55.117 2.693 1.427 2.693 2.946v1.018a62.182 62.182 0 00-13.5 0v-1.018c0-1.519 1.143-2.829 2.693-2.946l.307-.022v-.88a.75.75 0 011.5 0v.797zM12 12.75c-2.472 0-4.9.184-7.274.54-1.454.217-2.476 1.482-2.476 2.916v.384a4.104 4.104 0 012.585.364 2.605 2.605 0 002.33 0 4.104 4.104 0 013.67 0 2.605 2.605 0 002.33 0 4.104 4.104 0 013.67 0 2.605 2.605 0 002.33 0 4.104 4.104 0 012.585-.364v-.384c0-1.434-1.022-2.7-2.476-2.917A49.138 49.138 0 0012 12.75zM21.75 18.131a2.604 2.604 0 00-1.915.165 4.104 4.104 0 01-3.67 0 2.604 2.604 0 00-2.33 0 4.104 4.104 0 01-3.67 0 2.604 2.604 0 00-2.33 0 4.104 4.104 0 01-3.67 0 2.604 2.604 0 00-1.915-.165v2.494c0 1.036.84 1.875 1.875 1.875h15.75c1.035 0 1.875-.84 1.875-1.875v-2.494z" />
              </svg>
            </span>
            <div>
              <span className="profile-info-label">Birthday</span>
              <span className="profile-info-value">{formatDate(profile.date_of_birth)}</span>
            </div>
          </div>
        )}

        {profile?.linkedin_url && (
          <div className="profile-info-item">
            <span className="profile-info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
              </svg>
            </span>
            <div>
              <span className="profile-info-label">LinkedIn</span>
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="profile-info-link">
                View Profile
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="profile-stats">
        <div className="profile-stat">
          <span className="profile-stat-value">{profile?.attendance_rate ?? 0}%</span>
          <span className="profile-stat-label">Attendance Rate</span>
        </div>
      </div>

      {/* Actions */}
      <div className="profile-actions">
        <button onClick={onLogout} className="profile-logout-btn">
          Log Out
        </button>
      </div>
    </div>
  );
}

export default function Profile() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { user, profile, signIn, signOut, loading, refreshProfile } = useAuth();
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

  const handleSaveProfile = async (formData) => {
    await updateProfile(user.id, formData);
    await refreshProfile();
    setIsEditing(false);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="profile-page">
        <section className="profile-content">
          <div className="profile-container">
            <div className="profile-loading">
              <div className="profile-loading-spinner"></div>
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
            <div className="profile-modern-card" style={{ textAlign: 'center' }}>
              <div className="profile-avatar-placeholder" style={{ margin: '0 auto 20px' }}>
                <span>?</span>
              </div>
              <h1 className="profile-name">Welcome!</h1>
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                Logged in as: {user.email}
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
                Your profile is being set up. If this persists, please try logging out and back in.
              </p>
              <button onClick={handleLogout} className="profile-logout-btn">
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
      <section className="profile-content">
        <div className="profile-container">
          {user && profile ? (
            isEditing ? (
              <div className="profile-modern-card">
                <h2 className="profile-edit-title">Edit Profile</h2>
                <EditProfileForm
                  profile={profile}
                  onSave={handleSaveProfile}
                  onCancel={() => setIsEditing(false)}
                />
              </div>
            ) : (
              <UserProfileView
                profile={profile}
                onEdit={() => setIsEditing(true)}
                onLogout={handleLogout}
              />
            )
          ) : (
            <div className="profile-login-card">
              <h1 className="profile-login-title">Welcome Back</h1>
              <p className="profile-login-subtitle">Sign in to access your VENSA account</p>

              <form onSubmit={handleLogin} className="profile-login-form">
                {error && (
                  <div className="profile-error-banner">
                    {error}
                  </div>
                )}

                <div className="profile-field">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@ufl.edu"
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div className="profile-form-options">
                  <label className="profile-remember">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                  <Link to="#" className="profile-forgot">Forgot Password?</Link>
                </div>

                <button
                  type="submit"
                  className="profile-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>

                <div className="profile-divider">
                  <span>or</span>
                </div>

                <p className="profile-signup-prompt">
                  New to VENSA? <Link to="/signup" className="profile-signup-link">Create an account</Link>
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
                  <span>University of Florida</span>
                </a>
                <a
                  href="https://www.linkedin.com/company/ufvensa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-item"
                >
                  <img src={linkedinIcon} alt="LinkedIn" className="contact-icon" />
                  <span>VENSA at UF</span>
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

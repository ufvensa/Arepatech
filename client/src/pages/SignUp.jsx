import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, isAllowedEmail } from "../context/AuthContext";
import ufLogo from "../images/VENSA Website UF Logo.png";
import vensaLogo from "../images/VENSA Website Logo.png";
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
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Check if email is valid UFL email in real-time
  const emailError = email && !isAllowedEmail(email)
    ? "Please use your @ufl.edu email address"
    : "";

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Validate UFL email
    if (!isAllowedEmail(email)) {
      setError("Only @ufl.edu email addresses are allowed. Please use your GatorLink email.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await signUp({
        email,
        password,
        firstName,
        lastName,
        username,
        major,
        year,
        dateOfBirth: dateOfBirth || null,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Check if email confirmation is required
      if (data?.user && !data.session) {
        alert("Please check your UFL email to confirm your account!");
        navigate("/profile");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
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
              {error && (
                <div className="signup-error" style={{
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
                  type="date"
                  id="dateOfBirth"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="signup-input"
                  required
                />
              </div>

              <div className="signup-form-group">
                <label htmlFor="major" className="signup-label">Major</label>
                <select
                  id="major"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="signup-input signup-select"
                  required
                >
                  <option value="">Select Major</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Advertising">Advertising</option>
                  <option value="Aerospace Engineering">Aerospace Engineering</option>
                  <option value="African American Studies">African American Studies</option>
                  <option value="Agricultural and Biological Engineering">Agricultural and Biological Engineering</option>
                  <option value="Agricultural Education and Communication">Agricultural Education and Communication</option>
                  <option value="Animal Sciences">Animal Sciences</option>
                  <option value="Anthropology">Anthropology</option>
                  <option value="Applied Physiology and Kinesiology">Applied Physiology and Kinesiology</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Art">Art</option>
                  <option value="Art History">Art History</option>
                  <option value="Astronomy and Astrophysics">Astronomy and Astrophysics</option>
                  <option value="Biochemistry and Molecular Biology">Biochemistry and Molecular Biology</option>
                  <option value="Biology">Biology</option>
                  <option value="Biomedical Engineering">Biomedical Engineering</option>
                  <option value="Botany">Botany</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Chemical Engineering">Chemical Engineering</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Classical Studies">Classical Studies</option>
                  <option value="Communication Sciences and Disorders">Communication Sciences and Disorders</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Construction Management">Construction Management</option>
                  <option value="Criminology">Criminology</option>
                  <option value="Dance">Dance</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Dietetics">Dietetics</option>
                  <option value="Digital Arts and Sciences">Digital Arts and Sciences</option>
                  <option value="Economics">Economics</option>
                  <option value="Education Sciences">Education Sciences</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="English">English</option>
                  <option value="Entomology and Nematology">Entomology and Nematology</option>
                  <option value="Environmental Engineering">Environmental Engineering</option>
                  <option value="Environmental Science">Environmental Science</option>
                  <option value="Family, Youth and Community Sciences">Family, Youth and Community Sciences</option>
                  <option value="Finance">Finance</option>
                  <option value="Food and Resource Economics">Food and Resource Economics</option>
                  <option value="Food Science and Human Nutrition">Food Science and Human Nutrition</option>
                  <option value="Forest Resources and Conservation">Forest Resources and Conservation</option>
                  <option value="French and Francophone Studies">French and Francophone Studies</option>
                  <option value="Geography">Geography</option>
                  <option value="Geology">Geology</option>
                  <option value="Geomatics">Geomatics</option>
                  <option value="German">German</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Health Education and Behavior">Health Education and Behavior</option>
                  <option value="Health Science">Health Science</option>
                  <option value="History">History</option>
                  <option value="Horticultural Science">Horticultural Science</option>
                  <option value="Industrial and Systems Engineering">Industrial and Systems Engineering</option>
                  <option value="Information Systems">Information Systems</option>
                  <option value="Interior Design">Interior Design</option>
                  <option value="International Studies">International Studies</option>
                  <option value="Jewish Studies">Jewish Studies</option>
                  <option value="Journalism">Journalism</option>
                  <option value="Landscape Architecture">Landscape Architecture</option>
                  <option value="Linguistics">Linguistics</option>
                  <option value="Management">Management</option>
                  <option value="Marine Sciences">Marine Sciences</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Materials Science and Engineering">Materials Science and Engineering</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Microbiology and Cell Science">Microbiology and Cell Science</option>
                  <option value="Music">Music</option>
                  <option value="Music Education">Music Education</option>
                  <option value="Natural Resource Conservation">Natural Resource Conservation</option>
                  <option value="Nuclear Engineering">Nuclear Engineering</option>
                  <option value="Nursing">Nursing</option>
                  <option value="Nutritional Sciences">Nutritional Sciences</option>
                  <option value="Pharmaceutical Sciences">Pharmaceutical Sciences</option>
                  <option value="Philosophy">Philosophy</option>
                  <option value="Physics">Physics</option>
                  <option value="Plant Science">Plant Science</option>
                  <option value="Political Science">Political Science</option>
                  <option value="Portuguese">Portuguese</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Public Health">Public Health</option>
                  <option value="Public Relations">Public Relations</option>
                  <option value="Religion">Religion</option>
                  <option value="Sociology">Sociology</option>
                  <option value="Soil and Water Sciences">Soil and Water Sciences</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Spanish and Portuguese">Spanish and Portuguese</option>
                  <option value="Sport Management">Sport Management</option>
                  <option value="Statistics">Statistics</option>
                  <option value="Sustainability and the Built Environment">Sustainability and the Built Environment</option>
                  <option value="Sustainability Studies">Sustainability Studies</option>
                  <option value="Telecommunication">Telecommunication</option>
                  <option value="Theatre">Theatre</option>
                  <option value="Theatre Performance">Theatre Performance</option>
                  <option value="Theatre Production">Theatre Production</option>
                  <option value="Tourism, Hospitality and Event Management">Tourism, Hospitality and Event Management</option>
                  <option value="Wildlife Ecology and Conservation">Wildlife Ecology and Conservation</option>
                  <option value="Women's Studies">Women's Studies</option>
                  <option value="Zoology">Zoology</option>
                  <option value="Undeclared">Undeclared</option>
                  <option value="Other">Other</option>
                </select>
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
                <label htmlFor="email" className="signup-label">Email (UFL Only)</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@ufl.edu"
                  className="signup-input"
                  style={emailError ? { borderColor: '#ef4444' } : {}}
                  required
                />
                {emailError && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {emailError}
                  </span>
                )}
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

              <button
                type="submit"
                className="signup-button"
                disabled={isLoading || !!emailError}
                style={isLoading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
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

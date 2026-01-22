import { Link } from "react-router-dom";
import bannerBg from "../images/VENSA Website Banner Background.png";
import aboutUsImg from "../images/VENSA Website About Us.png";
import visionImg from "../images/VENSA Website Vision.png";
import missionImg from "../images/VENSA Website Mission.png";
import ufLogo from "../images/VENSA Website UF Logo.png";
import vensaLogo from "../images/Vensa Website logo.png";
import instagramIcon from "../images/Vensa Website Instagram.png";
import facebookIcon from "../images/Vensa Website Facebook.png";
import pinIcon from "../images/Vensa Website Pin.png";
import linkedinIcon from "../images/Vensa Website Linkedin.png";

export default function About() {
  return (
    <div className="about-page">
      {/* Hero Banner */}
      <div 
        className="hero-banner"
        style={{ backgroundImage: `url(${bannerBg})` }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Executive Board</h1>
          <Link to="/exec-board" className="hero-button">Meet the E-Board</Link>
        </div>
      </div>

      {/* About Us Section */}
      <section className="content-section">
        <div className="content-grid">
          <div className="content-text">
            <h2 className="section-title">ABOUT US</h2>
            <p className="section-description">
              The University of Florida Venezuelan Student Association (UF VENSA) is a student-led organization dedicated to celebrating Venezuelan culture and empowering the Venezuelan community on campus. Through cultural events, educational programs, and community outreach, we strive to create a welcoming space where students can connect, share their heritage, and build lasting friendships. UF VENSA promotes diversity, leadership, and unity while fostering cross-cultural understanding within the Gator Nation.
            </p>
          </div>
          <div className="content-image-wrapper">
            <img 
              src={aboutUsImg} 
              alt="Venezuelan food and culture"
              className="content-image"
            />
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="content-section">
        <div className="content-grid">
          <div className="content-text">
            <h2 className="section-title">VISION</h2>
            <p className="section-description">
              Our vision is to strengthen the Venezuelan presence at the University of Florida and inspire pride in our cultural identity. We aim to be a bridge between Venezuelan and non-Venezuelan communities by promoting collaboration, service, and cultural awareness—empowering students to become leaders who embody resilience, compassion, and global citizenship.
            </p>
          </div>
          <div className="content-image-wrapper">
            <img 
              src={visionImg} 
              alt="Venezuelan culture"
              className="content-image"
            />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="content-section">
        <div className="content-grid">
          <div className="content-text">
            <h2 className="section-title">MISSION</h2>
            <p className="section-description">
              The purpose of the Venezuelan Student Association at the University of Florida is to promote unity among all Venezuelans; to share our culture with everyone in Gainesville, to guide newly arrived Venezuelan students in their process of cultural, academic, and social adaptation, and to increase the general awareness of current events in Venezuela.
            </p>
          </div>
          <div className="content-image-wrapper">
            <img 
              src={missionImg} 
              alt="Venezuelan culture"
              className="content-image"
            />
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
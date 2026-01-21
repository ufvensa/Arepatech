import { Link } from "react-router-dom";
import bannerBg from "../images/VENSA Website Banner Background.png";
import img1 from "../images/VENSA Mentorship One.png";
import img2 from "../images/VENSA Mentorship OneTwo.png";
import img3 from "../images/VENSA Mentorship OneThree.png";
import img4 from "../images/VENSA Mentorship Two.png";
import img5 from "../images/VENSA Mentorship TwoTwo.png";
import img6 from "../images/VENSA Mentorship TwoThree.png";
import img7 from "../images/VENSA Mentorship Three.png";
import img8 from "../images/VENSA Mentorship ThreeTwo.png";
import img9 from "../images/VENSA Mentorship ThreeThree.png";
import img10 from "../images/VENSA Mentorship Four.png";
import img11 from "../images/VENSA Mentorship FourTwo.png";
import img12 from "../images/VENSA Mentorship FourThree.png";
import ufLogo from "../images/VENSA Website UF Logo.png";
import vensaLogo from "../images/Vensa Website logo.png";
import instagramIcon from "../images/Vensa Website Instagram.png";
import facebookIcon from "../images/Vensa Website Facebook.png";
import pinIcon from "../images/Vensa Website Pin.png";
import linkedinIcon from "../images/Vensa Website Linkedin.png";

export default function Mentorship() {
  const galleryImages = [
    img1, img2, img3, img4, img5, img6,
    img7, img8, img9, img10, img11, img12
  ];

  return (
    <div className="mentorship-page">
      {/* Hero Banner */}
      <div 
        className="mentorship-hero"
        style={{ backgroundImage: `url(${bannerBg})` }}
      >
        <div className="mentorship-hero-overlay"></div>
        <div className="mentorship-hero-content">
          <h1 className="mentorship-hero-title">Mentorship Program</h1>
          <p className="mentorship-hero-subtitle">
            Connect with experienced members and grow together as proud Venezuelan Gators
          </p>
          <Link 
            to="/exec-board" 
            className="mentorship-hero-button"
          >
            Share Interest with our Vice President
          </Link>
        </div>
      </div>

      {/* What is the Mentorship Program Section */}
      <section className="mentorship-description">
        <div className="mentorship-description-container">
          <div className="mentorship-description-header">
            <img src={vensaLogo} alt="Mentorship Icon" className="mentorship-icon" />
            <h2 className="mentorship-description-title">What is the Mentorship Program?</h2>
            <img src={vensaLogo} alt="Mentorship Icon" className="mentorship-icon" />
          </div>
          
          <div className="mentorship-description-content">
            <div className="mentorship-feature">
              <span className="mentorship-feature-label">Opportunity:</span>
              <span className="mentorship-feature-text"> Opportunity to grow both socially and professionally</span>
            </div>
            
            <div className="mentorship-feature">
              <span className="mentorship-feature-label">Weekly Challenges:</span>
              <span className="mentorship-feature-text"> Weekly challenges to keep us active during the semester</span>
            </div>
            
            <div className="mentorship-feature">
              <span className="mentorship-feature-label">Friendships:</span>
              <span className="mentorship-feature-text"> Connect with other members and create lifelong friendships</span>
            </div>
            
            <div className="mentorship-feature">
              <span className="mentorship-feature-label">Mentors:</span>
              <span className="mentorship-feature-text"> Your mentor is a person who can help you throughout your time at UF</span>
            </div>
            
            <div className="mentorship-feature">
              <span className="mentorship-feature-label">Prizes:</span>
              <span className="mentorship-feature-text"> Top 3 teams will receive prizes at the end of the semester</span>
            </div>
            
            <div className="mentorship-feature">
              <span className="mentorship-feature-label">Have fun!!:</span>
              <span className="mentorship-feature-text"> Keep your spirit up and remember that the most important thing is to have fun</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="mentorship-gallery">
        <div className="mentorship-gallery-container">
          <h2 className="mentorship-gallery-title">Past Mentorship Activities</h2>
          <div className="mentorship-gallery-grid">
            {galleryImages.map((img, index) => (
              <div key={index} className="mentorship-gallery-item">
                <img src={img} alt={`Mentorship activity ${index + 1}`} />
              </div>
            ))}
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
            © Copyright 2025. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

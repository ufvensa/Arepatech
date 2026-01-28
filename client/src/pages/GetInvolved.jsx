import { Link } from "react-router-dom";
import bannerBg from "../images/VENSA Website Banner Background.png";
import missionImg from "../images/VENSA Website Mission.png";
import visionImg from "../images/VENSA Website Vision.png";
import mentorshipInvolvedImg from "../images/VENSA Mentorship Involved.png";
import ufLogo from "../images/VENSA Website UF Logo.png";
import vensaLogo from "../images/VENSA Website Logo.png";
import instagramIcon from "../images/Vensa Website Instagram.png";
import facebookIcon from "../images/Vensa Website Facebook.png";
import pinIcon from "../images/Vensa Website Pin.png";
import linkedinIcon from "../images/Vensa Website Linkedin.png";

export default function GetInvolved() {
  return (
    <div className="get-involved-page">
      {/* Hero Banner */}
      <div
        className="get-involved-hero"
        style={{ backgroundImage: `url(${bannerBg})` }}
      >
        <div className="get-involved-hero-overlay"></div>
        <div className="get-involved-hero-content">
          <h1 className="get-involved-hero-title">Get Involved</h1>
          <p className="get-involved-hero-subtitle">
            Whether you're Venezuelan or simply interested in our culture, we are excited to meet you and have you join VENSA!
          </p>
          <div className="get-involved-hero-buttons">
            <Link to="/alumni" className="get-involved-hero-button">Alumni</Link>
          </div>
        </div>
      </div>

      {/* Mentorship Section */}
      <section className="content-section">
        <div className="content-grid content-grid-reverse">
          <div className="content-image-wrapper">
            <img
              src={mentorshipInvolvedImg}
              alt="Mentorship"
              className="content-image"
            />
          </div>
          <div className="content-text">
            <h2 className="section-title">MENTORSHIP</h2>
            <p className="section-description">
              Our mentorship program pairs experienced members with newcomers to help navigate university life, build
              community, and grow together as proud Venezuelan Gators. Whether you're looking for academic advice,
              cultural connection, or simply a friendly face on campus, our mentors are here to help you thrive at UF.
            </p>
            <Link to="/mentorship" className="involvement-button">Learn about our Mentorship Program</Link>
          </div>
        </div>
      </section>

      {/* Get Advice Section */}
      <section className="content-section">
        <div className="content-grid content-grid-reverse">
          <div className="content-image-wrapper">
            <img
              src={missionImg}
              alt="Get Advice"
              className="content-image"
            />
          </div>
          <div className="content-text">
            <h2 className="section-title">GET ADVICE</h2>
            <p className="section-description">
              Need guidance on academics, career planning, or adjusting to life at UF? Our community is here to support you.
              Connect with experienced VENSA members that have been through similar experiences. Our members are ready to share their knowledge and experiences to help
              you succeed. Discover a network of support that is available only to VENSA members!
            </p>
            <Link to="/directory" className="involvement-button">Meet Members</Link>
          </div>
        </div>
      </section>

      {/* Opportunities Section */}
      <section className="content-section">
        <div className="content-grid content-grid-reverse">
          <div className="content-image-wrapper">
            <img
              src={visionImg}
              alt="Opportunities"
              className="content-image"
            />
          </div>
          <div className="content-text">
            <h2 className="section-title">OPPORTUNITIES</h2>
            <p className="section-description">
              VENSA offers a wide variety of opportunities throughout the year that are available to all VENSA members.
              Explore the many ways to get involved, develop your skills, and make an impact through UF VENSA’s opportunities
              - from internships and leadership programs to volunteer and networking events that will help you grow personally
              and professionally while celebrating Venezuelan culture.
            </p>
            <Link to="/resources" className="involvement-button">Explore Opportunities</Link>
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
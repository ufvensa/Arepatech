import { Link } from "react-router-dom";
import bannerBg from "../images/VENSA UF Banner.png";
import ufLogo from "../images/VENSA Website UF Logo.png";
const vensaLogo = "/vensa-logo.png";
import instagramIcon from "../images/VENSA Website Instagram.png";
import facebookIcon from "../images/VENSA Website Facebook.png";
import pinIcon from "../images/VENSA Website Pin.png";
import linkedinIcon from "../images/VENSA Website LinkedIn.png";

export default function Alumni() {
  return (
    <div className="alumni-page">
      {/* Hero Banner */}
      <div
        className="alumni-hero"
        style={{ backgroundImage: `url(${bannerBg})` }}
      >
        <div className="alumni-hero-overlay"></div>
        <div className="alumni-hero-content">
          <h1 className="alumni-hero-title">Alumni</h1>
        </div>
      </div>

      {/* Alumni Content Section */}
      <section className="alumni-content">
        <div className="alumni-container">
          <h2 className="alumni-title">Hello VENSA Alumni</h2>
          <p className="alumni-description">
            Thank you for your interest in staying connected with VENSA and supporting the next generation of Venezuelan Gators.
            By joining the following group chat, you will be connected to a vibrant network of past members who share your passion for Venezuelan culture and community.
            Our goal is to strengthen the ties within our comunidad by showcasing the diverse paths our members
            take after UF so that students can learn from your experiences, reach out for guidance, and follow in your footsteps.
            We will also be reaching out about a VENSA Alumni Directory that will help create networking opportunities, foster mentorship and support, and celebrate the
            achievements of our members while building a strong, lasting connection between current students and alumni. As a family,
            we honor where we come from and lift each other up as we grow, and we would be proud to have you join this initiative
            and remain part of the VENSA familia.
          </p>
          <a
            href="https://chat.whatsapp.com/JoKP72msSu0AYtOr3c0KoJ"
            target="_blank"
            rel="noopener noreferrer"
            className="alumni-button"
          >
            Join the Alumni Whatsapp
          </a>
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

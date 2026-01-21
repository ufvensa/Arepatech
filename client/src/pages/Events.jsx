import { Link } from "react-router-dom";
import bannerBg from "../images/VENSA Website Banner Background.png";
import gbmImg from "../images/VENSA GBM.png";
import bonfireImg from "../images/VENSA Bonfire.png";
import resumeWorkshopImg from "../images/VENSA Resume Workshop.png";
import vensaLogo from "../images/Vensa Website logo.png";
import ufLogo from "../images/VENSA Website UF Logo.png";
import instagramIcon from "../images/Vensa Website Instagram.png";
import facebookIcon from "../images/Vensa Website Facebook.png";
import pinIcon from "../images/Vensa Website Pin.png";
import linkedinIcon from "../images/Vensa Website Linkedin.png";

export default function Events() {
  return (
    <div className="events-page">
      {/* Hero Banner */}
      <div 
        className="events-hero"
        style={{ backgroundImage: `url(${bannerBg})` }}
      >
        <div className="events-hero-overlay"></div>
        <div className="events-hero-content">
          <h1 className="events-hero-title">Upcoming Events</h1>
          <p className="events-hero-subtitle">
            Discover what's happening with VENSA at all times!
          </p>
          <div className="events-hero-buttons">
            <a 
              href="https://chat.whatsapp.com/DxcXPAsGNA5BeoPFAKyoAn" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="events-hero-button"
            >
              Join our Whatsapp
            </a>
            <a 
              href="https://www.instagram.com/ufvensa/?hl=en" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="events-hero-button"
            >
              Follow us on Instagram
            </a>
          </div>
        </div>
      </div>

      {/* What's Happening Section */}
      <section className="events-happening">
        <h2 className="events-happening-title">What Events does VENSA Host?</h2>
        <div className="events-happening-content">
          <img src={vensaLogo} alt="VENSA Logo" className="events-happening-logo" />
          <p className="events-happening-text">
            From picnics to running to professional development, VENSA hosts a variety of events each month. 
            Discover spaces that connect Venezuelan students at the University of Florida with each 
            other through culture and community.
          </p>
          <img src={vensaLogo} alt="VENSA Logo" className="events-happening-logo" />
        </div>
      </section>

      {/* This Month's Events Section */}
      <section className="events-monthly">
        <h2 className="events-section-title">This Month's Events</h2>
        <div className="events-cards-container">
          <div className="event-card">
            <div className="event-card-image">
              <img src={gbmImg} alt="Spring GBM #1" />
            </div>
            <div className="event-card-content">
              <h3 className="event-card-title">Spring GBM #1</h3>
              <div className="event-card-detail">
                <span className="event-label">Date:</span>
                <span>January 21, 2026</span>
              </div>
              <div className="event-card-detail">
                <span className="event-label">Time:</span>
                <span>6:00 PM</span>
              </div>
              <div className="event-card-detail">
                <span className="event-label">Location:</span>
                <span>NPB Physics Building 1002</span>
              </div>
              <p className="event-card-description">
                Come join us for our first event of the semester! Meet new people, <br />learn about upcoming events,
                and get involved with VENSA!
              </p>
              <button className="event-rsvp-button">RSVP Now</button>
            </div>
          </div>

          <div className="event-card event-card-reverse">
            <div className="event-card-image">
              <img src={bonfireImg} alt="Bonfire Night" />
            </div>
            <div className="event-card-content">
              <h3 className="event-card-title">Bonfire</h3>
              <div className="event-card-detail">
                <span className="event-label">Date:</span>
                <span>January 23, 2026</span>
              </div>
              <div className="event-card-detail">
                <span className="event-label">Time:</span>
                <span>5:30 PM</span>
              </div>
              <div className="event-card-detail">
                <span className="event-label">Location:</span>
                <span>TBD</span>
              </div>
              <p className="event-card-description">
                Warm up your winter and join us for an evening of fun, <br />food, and friendship around the fire.
              </p>
              <button className="event-rsvp-button">RSVP Now</button>
            </div>
          </div>

          <div className="event-card">
            <div className="event-card-image">
              <img src={resumeWorkshopImg} alt="Resume Workshop" />
            </div>
            <div className="event-card-content">
              <h3 className="event-card-title">Resume Workshop</h3>
              <div className="event-card-detail">
                <span className="event-label">Date:</span>
                <span>January 28, 2026</span>
              </div>
              <div className="event-card-detail">
                <span className="event-label">Time:</span>
                <span>4:00 PM</span>
              </div>
              <div className="event-card-detail">
                <span className="event-label">Location:</span>
                <span>TBD</span>
              </div>
              <p className="event-card-description">
                Want to make your resume stand out right before Career Showcase? <br /> Join us to get tips and tricks on building the best resume!
              </p>
              <button className="event-rsvp-button">RSVP Now</button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Action Sections */}
      <section className="events-actions">
        <div className="events-action-item">
          <div className="events-action-icon">📅</div>
          <div className="events-action-content">
            <h3 className="events-action-title">Calendar</h3>
            <p className="events-action-description">Explore more Vensa events!</p>
          </div>
          <button className="events-action-button">View Calendar</button>
        </div>

        <div className="events-action-item">
          <div className="events-action-icon">📷</div>
          <div className="events-action-content">
            <h3 className="events-action-title">Past Events</h3>
            <p className="events-action-description">See Past Events we have hosted!</p>
          </div>
          <button className="events-action-button">See Past Events</button>
        </div>

        <div className="events-action-item">
          <div className="events-action-icon">⚽</div>
          <div className="events-action-content">
            <h3 className="events-action-title">Intramurals</h3>
            <p className="events-action-description">Explore and Join Vensa intramural sports</p>
          </div>
          <button className="events-action-button">Join Intramurals</button>
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
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import bannerBg from "../images/VENSA Website Banner Background.png";
import vensaLogo from "../images/VENSA Website Logo.png";
import ufLogo from "../images/VENSA Website UF Logo.png";
import instagramIcon from "../images/VENSA Website Instagram.png";
import facebookIcon from "../images/VENSA Website Facebook.png";
import pinIcon from "../images/VENSA Website Pin.png";
import linkedinIcon from "../images/VENSA Website LinkedIn.png";
import { fetchCalendarEvents, separateEvents } from "../lib/calendar";

export default function PreviousEvents() {
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      const events = await fetchCalendarEvents();
      const { past } = separateEvents(events);
      setPastEvents(past);
      setLoading(false);
    }
    loadEvents();
  }, []);
  return (
    <div className="events-page">
      {/* Hero Banner */}
      <div
        className="events-hero"
        style={{ backgroundImage: `url(${bannerBg})` }}
      >
        <div className="events-hero-overlay"></div>
        <div className="events-hero-content">
          <h1 className="events-hero-title">Previous Events</h1>
          <p className="events-hero-subtitle">
            Take a look at the amazing events we've hosted in the past!
          </p>
          <div className="events-hero-buttons">
            <Link to="/events" className="events-hero-button">
              View Upcoming Events
            </Link>
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

      {/* Previous Events Section */}
      <section className="events-monthly">
        <h2 className="events-section-title">Past Events</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <p>Loading events...</p>
          </div>
        ) : pastEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <p>No past events to display.</p>
          </div>
        ) : (
          <div className="events-cards-container">
            {pastEvents.map((event, index) => (
              <div key={event.id} className={index % 2 === 0 ? "event-card" : "event-card event-card-reverse"}>
                <div className="event-card-image">
                  <img 
                    src={event.imageUrl || vensaLogo} 
                    alt={event.title} 
                    style={{ 
                      objectFit: event.imageUrl ? 'cover' : 'contain', 
                      padding: event.imageUrl ? '0' : '40px', 
                      backgroundColor: event.imageUrl ? 'transparent' : '#f3f4f6',
                      width: '100%',
                      height: '100%'
                    }} 
                  />
                </div>
                <div className="event-card-content">
                  <h3 className="event-card-title">{event.title}</h3>
                  <div className="event-card-detail">
                    <span className="event-label">Date:</span>
                    <span>{event.startDateFormatted}</span>
                  </div>
                  <div className="event-card-detail">
                    <span className="event-label">Time:</span>
                    <span>{event.startTime}</span>
                  </div>
                  <div className="event-card-detail">
                    <span className="event-label">Location:</span>
                    <span>{event.location}</span>
                  </div>
                  {event.description && (
                    <p className="event-card-description">
                      {event.description}
                    </p>
                  )}
                  <div style={{ padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '8px', marginTop: '10px' }}>
                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Event Completed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom Action Sections */}
      <section className="events-actions">
        <div className="events-action-item">
          <div className="events-action-content">
            <h3 className="events-action-title">Newsletter</h3>
            <p className="events-action-description">Stay updated with VENSA news and announcements!</p>
          </div>
          <button className="events-action-button">Subscribe</button>
        </div>

        <div className="events-action-item">
          <div className="events-action-content">
            <h3 className="events-action-title">Upcoming Events</h3>
            <p className="events-action-description">Check out our upcoming events!</p>
          </div>
          <Link to="/events" className="events-action-button">View Upcoming Events</Link>
        </div>

        <div className="events-action-item">
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
            © Copyright 2026. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

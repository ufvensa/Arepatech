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

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function Events() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [rsvpCounts, setRsvpCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      const events = await fetchCalendarEvents();
      const { upcoming } = separateEvents(events);
      setUpcomingEvents(upcoming);
      setLoading(false);
      
      // Load RSVP counts for events that have spreadsheetId
      loadRSVPCounts(upcoming);
    }
    loadEvents();
  }, []);

  async function loadRSVPCounts(events) {
    // Skip RSVP count fetching if no backend API URL is configured
    if (!API_BASE_URL) return;

    // Fetch RSVP counts for events that have a spreadsheetId
    const counts = {};
    
    for (const event of events) {
      if (event.spreadsheetId) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/sheets/rsvp-count/${event.spreadsheetId}`
          );
          const data = await response.json();
          
          if (data.success) {
            counts[event.id] = data.count;
          }
        } catch (error) {
          console.error(`Failed to fetch RSVP count for event ${event.id}:`, error);
        }
      }
    }
    
    setRsvpCounts(counts);
  }
  
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
        <h2 className="events-section-title">Upcoming Events</h2>
        {loading ? (
          <div className="events-empty-state">
            <p>Loading events...</p>
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="events-empty-state">
            <p className="events-empty-title">More Events Coming Soon!</p>
            <p className="events-empty-subtitle">Stay tuned. We're always planning something exciting for our VENSA family.</p>
          </div>
        ) : (
          <div className="events-cards-container">
            {upcomingEvents.slice(0, 3).map((event, index) => (
              <div key={event.id} className={index % 2 === 0 ? "event-card" : "event-card event-card-reverse"}>
                <div className="event-card-image">
                  <img 
                    src={event.imageUrl || vensaLogo} 
                    alt={event.title} 
                    style={{ 
                      objectFit: event.imageUrl ? 'cover' : 'contain', 
                      padding: event.imageUrl ? '0' : '40px', 
                      backgroundColor: event.imageUrl ? 'transparent' : '#f3f4f6'
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
                      {event.description
                        .replace(/<[^>]*>/g, '') // Remove HTML tags
                        .split(/FORM_URL:/i)[0] // Get text before FORM_URL
                        .split(/SPREADSHEET_ID:/i)[0] // Get text before SPREADSHEET_ID
                        .trim()}
                    </p>
                  )}
                  <button 
                    className="event-rsvp-button"
                    onClick={() => {
                      if (event.formUrl) {
                        window.open(event.formUrl, '_blank');
                      } else {
                        alert('RSVP form not available for this event yet.');
                      }
                    }}
                  >
                    RSVP Now
                  </button>
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
          <a
            href="https://vensanewsletter.my.canva.site/"
            target="_blank"
            rel="noopener noreferrer"
            className="events-action-button"
            style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
          >Subscribe</a>
        </div>

        <div className="events-action-item">
          <div className="events-action-content">
            <h3 className="events-action-title">Past Events</h3>
            <p className="events-action-description">See Past Events we have hosted!</p>
          </div>
          <Link to="/previous-events" className="events-action-button">See Past Events</Link>
        </div>

        <div className="events-action-item">
          <div className="events-action-content">
            <h3 className="events-action-title">Intramurals</h3>
            <p className="events-action-description">Explore and Join Vensa intramural sports</p>
          </div>
          <a 
            href="https://chat.whatsapp.com/DaZ66qAsf5pIk8Jf4qrR1K?mode=gi_t"
            target="_blank"
            rel="noopener noreferrer"
            className="events-action-button"
            style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
          >
            Join Intramurals
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

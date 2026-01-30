import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import bannerBg from "../images/VENSA Website Banner Background.png";
import vensaLogo from "../images/VENSA Website Logo.png";
import ufLogo from "../images/VENSA Website UF Logo.png";
import instagramIcon from "../images/VENSA Website Instagram.png";
import facebookIcon from "../images/VENSA Website Facebook.png";
import pinIcon from "../images/VENSA Website Pin.png";
import linkedinIcon from "../images/VENSA Website LinkedIn.png";
import gbmImage from "../images/VENSA GBM.png";
import bonfireImage from "../images/VENSA Bonfire.png";
import resumeWorkshopImage from "../images/VENSA Resume Workshop.png";
import { fetchCalendarEvents, separateEvents } from "../lib/calendar";

// Hardcoded fallback events
const fallbackEvents = [
  {
    id: 'resume-workshop-2026',
    title: 'Resume Workshop',
    description: 'Join us for a comprehensive resume workshop to enhance your professional profile.',
    location: 'TBD',
    imageUrl: resumeWorkshopImage,
    startDateFormatted: 'January 28, 2026',
    startTime: 'TBD'
  },
  {
    id: 'bonfire-2026',
    title: 'Bonfire',
    description: 'Come join us for a fun evening bonfire social event!',
    location: 'TBD',
    imageUrl: bonfireImage,
    startDateFormatted: 'January 23, 2026',
    startTime: '5:30 PM'
  },
  {
    id: 'spring-gbm-1-2026',
    title: 'Spring GBM #1',
    description: 'Our first General Body Meeting of the Spring semester. Come meet the team and learn about upcoming events!',
    location: 'TBD',
    imageUrl: gbmImage,
    startDateFormatted: 'January 21, 2026',
    startTime: '6:00 PM'
  }
];

export default function PreviousEvents() {
  const [pastEvents, setPastEvents] = useState(fallbackEvents);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log('PreviousEvents render - pastEvents:', pastEvents);
  console.log('PreviousEvents render - loading:', loading);

  const openEventModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeEventModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  useEffect(() => {
    console.log('useEffect running - initial pastEvents:', pastEvents);
    async function loadEvents() {
      try {
        const events = await fetchCalendarEvents();
        console.log('Fetched calendar events:', events);
        const { past } = separateEvents(events);
        console.log('Separated past events:', past);
        console.log('Individual past events:', past.map(e => ({ id: e.id, title: e.title, imageUrl: e.imageUrl })));
        // Only update if we got events from calendar
        if (past.length > 0) {
          setPastEvents(past);
          console.log('Updated pastEvents state with calendar events');
        }
      } catch (error) {
        console.error('Error loading calendar events:', error);
        // Keep fallback events on error
      }
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

      {/* Previous Events Gallery Section */}
      <section className="events-monthly">
        <h2 className="events-section-title">Past Events Gallery</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <p>Loading events...</p>
          </div>
        ) : pastEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <p>No past events to display.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            padding: '40px 20px',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {pastEvents.map((event) => (
              <div key={event.id} 
              onClick={() => openEventModal(event)}
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                backgroundColor: '#fff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}>
                {/* Event Image */}
                <div style={{ 
                  width: '100%', 
                  height: '250px', 
                  overflow: 'hidden',
                  backgroundColor: '#f3f4f6'
                }}>
                  <img 
                    src={event.imageUrl || vensaLogo} 
                    alt={event.title} 
                    style={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: event.imageUrl ? 'cover' : 'contain',
                      padding: event.imageUrl ? '0' : '40px'
                    }} 
                  />
                </div>
                
                {/* Event Info Overlay */}
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.7))',
                  color: 'white',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0
                }}>
                  <h3 style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '1.25rem',
                    fontWeight: '600'
                  }}>
                    {event.title}
                  </h3>
                  <div style={{ 
                    fontSize: '0.9rem',
                    opacity: 0.9,
                    marginBottom: '5px'
                  }}>
                    📅 {event.startDateFormatted}
                  </div>
                  <div style={{ 
                    fontSize: '0.9rem',
                    opacity: 0.9
                  }}>
                    🕐 {event.startTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Event Photo Modal */}
      {isModalOpen && selectedEvent && (
        <div 
          onClick={closeEventModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              maxWidth: '1200px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              animation: 'slideUp 0.3s ease'
            }}
          >
            {/* Close Button */}
            <button
              onClick={closeEventModal}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'}
            >
              ×
            </button>

            {/* Event Header */}
            <div style={{
              padding: '30px',
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: 'white',
              borderRadius: '16px 16px 0 0'
            }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '2rem', fontWeight: '700' }}>
                {selectedEvent.title}
              </h2>
              <div style={{ display: 'flex', gap: '20px', fontSize: '1rem', opacity: 0.9 }}>
                <span>📅 {selectedEvent.startDateFormatted}</span>
                <span>🕐 {selectedEvent.startTime}</span>
                {selectedEvent.location && <span>📍 {selectedEvent.location}</span>}
              </div>
              {selectedEvent.description && (
                <p style={{ marginTop: '15px', opacity: 0.95, lineHeight: '1.6' }}>
                  {selectedEvent.description}
                </p>
              )}
            </div>

            {/* Event Photos Gallery */}
            <div style={{ padding: '30px' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.5rem', color: '#1f2937' }}>
                Event Photos
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '20px'
              }}>
                {/* Display main event image as a photo */}
                {[selectedEvent.imageUrl, selectedEvent.imageUrl, selectedEvent.imageUrl].map((photo, index) => (
                  <div 
                    key={index}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img 
                      src={photo || vensaLogo}
                      alt={`${selectedEvent.title} photo ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                ))}
              </div>
              <p style={{
                marginTop: '30px',
                textAlign: 'center',
                color: '#6b7280',
                fontStyle: 'italic'
              }}>
                Photos from {selectedEvent.title} - More photos coming soon!
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

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

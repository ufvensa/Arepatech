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
  const [driveEvents, setDriveEvents] = useState([]);
  const [useDrivePhotos, setUseDrivePhotos] = useState(false);

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
    
    // Fetch from Google Drive
    async function loadDriveEvents() {
      try {
        const response = await fetch('http://localhost:5000/api/drive/events');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched Google Drive events:', data);
          if (data.success && data.events.length > 0) {
            setDriveEvents(data.events);
            setUseDrivePhotos(true);
            console.log('✅ Google Drive photos loaded successfully');
          }
        } else {
          console.log('⚠️ Google Drive API not available, using fallback');
        }
      } catch (error) {
        console.error('Error loading Google Drive events:', error);
        console.log('⚠️ Falling back to calendar/hardcoded events');
      }
    }

    loadDriveEvents();

    // Fetch from calendar
    async function loadEvents() {
      try {
        const events = await fetchCalendarEvents();
        console.log('Fetched calendar events:', events);
        const { past } = separateEvents(events);
        console.log('Separated past events:', past);
        console.log('Individual past events:', past.map(e => ({ id: e.id, title: e.title, imageUrl: e.imageUrl })));
        
        // Group events by base name (e.g., "GBM #1", "GBM #2" become "GBM")
        const groupedEvents = {};
        past.forEach(event => {
          // Extract base event name (remove "#1", "#2", etc.)
          let baseName = event.title.replace(/\s*#\d+/i, '').trim();
          
          // Also normalize common variations
          if (baseName.toLowerCase().includes('general body meeting') || baseName.toLowerCase() === 'gbm') {
            baseName = 'General Body Meeting';
          }
          
          if (!groupedEvents[baseName]) {
            groupedEvents[baseName] = event;
          }
        });
        
        const uniqueEvents = Object.values(groupedEvents);
        
        // Only update if we got events from calendar
        if (uniqueEvents.length > 0) {
          setPastEvents(uniqueEvents);
          console.log('Updated pastEvents state with grouped calendar events');
        }
      } catch (error) {
        console.error('Error loading calendar events:', error);
        // Group fallback events too
        const groupedFallback = {};
        fallbackEvents.forEach(event => {
          let baseName = event.title.replace(/\s*#\d+/i, '').trim();
          if (baseName.toLowerCase().includes('general body meeting') || baseName.toLowerCase() === 'gbm') {
            baseName = 'General Body Meeting';
          }
          if (!groupedFallback[baseName]) {
            groupedFallback[baseName] = event;
          }
        });
        setPastEvents(Object.values(groupedFallback));
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
        ) : (useDrivePhotos && driveEvents.length > 0 ? driveEvents : pastEvents).length === 0 ? (
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
            {(useDrivePhotos && driveEvents.length > 0 ? driveEvents : pastEvents).map((event, index) => {
              // Venezuela flag colors: yellow, blue, red
              const colors = ['#FFCC00', '#0052D4', '#CF142B'];
              const textColor = colors[index % 3];
              const isBlue = (index % 3) === 1;
              
              return (
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
                  backgroundColor: '#f3f4f6',
                  position: 'relative'
                }}>
                  <img 
                    src={event.photos && event.photos.length > 0 ? event.photos[0].url : (event.imageUrl || vensaLogo)} 
                    alt={event.name || event.title} 
                    style={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: (event.photos && event.photos.length > 0) || event.imageUrl ? 'cover' : 'contain',
                      padding: (event.photos && event.photos.length > 0) || event.imageUrl ? '0' : '40px'
                    }} 
                  />
                  {/* Title Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '20px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
                  }}>
                    <h3 style={{ 
                      margin: '0', 
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: textColor,
                      textShadow: '3px 3px 6px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9), 1px -1px 2px rgba(0,0,0,0.9), -1px 1px 2px rgba(0,0,0,0.9)',
                      WebkitTextStroke: isBlue ? '0.5px rgba(255,255,255,0.8)' : '1px rgba(0,0,0,0.5)'
                    }}>
                      {(event.name || event.title).replace(/\s*#\d+/i, '').trim()}
                      {event.photoCount && (
                        <span style={{ 
                          fontSize: '0.9rem', 
                          marginLeft: '10px',
                          opacity: 0.9 
                        }}>
                          ({event.photoCount} photos)
                        </span>
                      )}
                    </h3>
                  </div>
                </div>
              </div>
              );
            })}
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
              <h2 style={{ margin: '0', fontSize: '2rem', fontWeight: '700' }}>
                {(selectedEvent.name || selectedEvent.title).replace(/\s*#\d+/i, '').trim()}
              </h2>
              {selectedEvent.description && (
                <p style={{ marginTop: '15px', opacity: 0.95, lineHeight: '1.6' }}>
                  {selectedEvent.description}
                </p>
              )}
            </div>

            {/* Event Photos Gallery */}
            <div style={{ padding: '30px' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.5rem', color: '#1f2937' }}>
                Event Photos {selectedEvent.photoCount && `(${selectedEvent.photoCount} photos)`}
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '20px'
              }}>
                {/* Check if event has Google Drive photos */}
                {selectedEvent.photos && selectedEvent.photos.length > 0 ? (
                  selectedEvent.photos.map((photo, index) => (
                    <div 
                      key={photo.id || index}
                      style={{
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f3f4f6',
                        aspectRatio: '4/3'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      onClick={() => window.open(photo.viewLink, '_blank')}
                    >
                      <img 
                        src={photo.url}
                        alt={photo.name || `${selectedEvent.title} photo ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        loading="lazy"
                      />
                    </div>
                  ))
                ) : (
                  /* Fallback: Display placeholder images */
                  [selectedEvent.imageUrl, selectedEvent.imageUrl, selectedEvent.imageUrl].map((photo, index) => (
                    <div 
                      key={index}
                      style={{
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f3f4f6'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <img 
                        src={photo || vensaLogo}
                        alt={`${selectedEvent.title} photo ${index + 1}`}
                        style={{
                          width: '100%',
                          height: 'auto',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
              <p style={{
                marginTop: '30px',
                textAlign: 'center',
                color: '#6b7280',
                fontStyle: 'italic'
              }}>
                {selectedEvent.photos && selectedEvent.photos.length > 0 
                  ? `Photos from ${selectedEvent.name || selectedEvent.title} - Click to view full size`
                  : `Photos from ${selectedEvent.title} - More photos coming soon!`
                }
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

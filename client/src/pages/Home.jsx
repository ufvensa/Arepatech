import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import bannerBg1 from "../images/VENSA Website Banner Background.png";
import bannerBg2 from "../images/VENSA Website About Us.png";
import bannerBg3 from "../images/VENSA Website Vision.png";
import bannerBg4 from "../images/VENSA Pilates.png";
import bannerBg5 from "../images/VENSA Website Mission.png";
import mentorshipHomeImg from "../images/VENSA Mentorship Home.png";
import BonfireImg from "../images/VENSA Bonfire.png";
import EboardImg from "../images/VENSA Eboard.png";
import ufLogo from "../images/VENSA Website UF Logo.png";
import vensaLogo from "../images/VENSA Website Logo.png";
import instagramIcon from "../images/VENSA Website Instagram.png";
import facebookIcon from "../images/VENSA Website Facebook.png";
import pinIcon from "../images/VENSA Website Pin.png";
import linkedinIcon from "../images/VENSA Website LinkedIn.png";
import { fetchCalendarEvents, separateEvents } from "../lib/calendar";

export default function Home() {
  const bannerImages = [bannerBg1, bannerBg2, bannerBg3, bannerBg4, bannerBg5];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextEvent, setNextEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Banner image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 7000); // Change image every 7 seconds

    return () => clearInterval(interval);
  }, [bannerImages.length]);

  // Fetch upcoming events from Google Calendar
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const events = await fetchCalendarEvents();
        const { upcoming } = separateEvents(events);
        
        // Get the next upcoming event
        if (upcoming.length > 0) {
          setNextEvent(upcoming[0]);
        }
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Countdown timer - updates based on next event
  useEffect(() => {
    if (!nextEvent) return;

    const updateCountdown = () => {
      const now = new Date();
      const difference = nextEvent.startDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextEvent]);
  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="home-hero">
        {bannerImages.map((image, index) => (
          <div
            key={index}
            className={`home-hero-bg ${index === currentImageIndex ? 'active' : ''} ${index === (currentImageIndex - 1 + bannerImages.length) % bannerImages.length ? 'prev' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="home-hero-overlay"></div>
        <div className="home-hero-content">
          <h1 className="home-hero-title">
            VENEZUELAN<br />STUDENT ASSOCIATION
          </h1>
          <h2 className="home-hero-subtitle">UNIVERSITY OF FLORIDA</h2>
          <Link to="/signup" className="home-hero-button">JOIN VENSA</Link>
        </div>
      </div>

      {/* Welcome Section */}
      <section className="home-welcome">
        <h2 className="home-welcome-title">WELCOME!!</h2>
        <p className="home-welcome-text">
          The Venezuelan Student Association at the University of Florida
          is dedicated to fostering a supportive community for Venezuelan
          students and promoting Venezuelan culture on campus.
        </p>
      </section>

      {/* Featured Event Section */}
      <section className="home-featured">
        <h2 className="home-featured-title">Featured Event</h2>
        {loading ? (
          <div className="home-featured-content">
            <p>Loading event...</p>
          </div>
        ) : nextEvent ? (
          <div className="home-featured-content">
            <div className="home-featured-image">
              <img src={nextEvent.imageUrl} alt={nextEvent.title} />
            </div>
            <div className="home-featured-details">
              <h3 className="home-featured-event-title">{nextEvent.title}</h3>
              <p className="home-featured-event-info">
                {nextEvent.startDateFormatted} @ {nextEvent.startTime}
                {nextEvent.location !== 'TBD' && ` • ${nextEvent.location}`}
              </p>
              <p className="home-featured-event-desc">
                {nextEvent.description 
                  ? nextEvent.description
                      .replace(/<[^>]*>/g, '') // Remove HTML tags
                      .split(/FORM_URL:/i)[0] // Get text before FORM_URL
                      .split(/SPREADSHEET_ID:/i)[0] // Get text before SPREADSHEET_ID
                      .trim() || 'Join us for this exciting event!'
                  : 'Join us for this exciting event!'}
              </p>
            </div>
            <div className="home-featured-countdown">
              <h3 className="home-countdown-title">Countdown</h3>
              <div className="countdown-display">
                <div className="countdown-item">
                  <div className="countdown-value">{timeRemaining.days}</div>
                  <div className="countdown-label">Days</div>
                </div>
                <div className="countdown-item">
                  <div className="countdown-value">{timeRemaining.hours}</div>
                  <div className="countdown-label">Hours</div>
                </div>
                <div className="countdown-item">
                  <div className="countdown-value">{timeRemaining.minutes}</div>
                  <div className="countdown-label">Minutes</div>
                </div>
                <div className="countdown-item">
                  <div className="countdown-value">{timeRemaining.seconds}</div>
                  <div className="countdown-label">Seconds</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="home-featured-content">
            <p>No upcoming events at this time. Check back soon!</p>
          </div>
        )}
      </section>

      {/* Bottom Sections */}
      <section className="home-bottom-sections">
        <div className="home-bottom-card">
          <h3 className="home-bottom-title">Mentorship</h3>
          <div className="home-bottom-image">
            <img src={mentorshipHomeImg} alt="Mentorship" />
          </div>
          <p className="home-bottom-text">
            At UF VENSA, mentorship connects new and returning members to share guidance,
            culture, and support. It helps students navigate UF, build community, and grow
            together as proud Venezuelan Gators.
          </p>
          <Link to="/mentorship" className="home-bottom-button">Learn about Mentorship</Link>
        </div>
        <div className="home-bottom-card">
          <h3 className="home-bottom-title">Contact Us</h3>
          <div className="home-bottom-image">
            <img src={EboardImg} alt="Contact" />
          </div>
          <p className="home-bottom-text">
            Reach out to UF VENSA E-Board to learn more about our events, membership,
            and community. We'd love to connect with you <br />and welcome you into our
            Venezuelan Gator family!
          </p>
          <Link to="/exec-board" className="home-bottom-button">E-Board Contacts</Link>
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
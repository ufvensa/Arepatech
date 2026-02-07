import { useState } from "react";
import { Link } from "react-router-dom";
import bannerBg from "../images/VENSA UF Banner.png";
import ufLogo from "../images/VENSA Website UF Logo.png";
import vensaLogo from "../images/VENSA Website Logo.png";
import instagramIcon from "../images/VENSA Website Instagram.png";
import facebookIcon from "../images/VENSA Website Facebook.png";
import pinIcon from "../images/VENSA Website Pin.png";
import linkedinIcon from "../images/VENSA Website LinkedIn.png";
import johnRileyImg from "../images/John Riley web dev picture.jpeg";
import stefiImg from "../images/stefi web dev picture.jpeg";
import andyImg from "../images/andy web dev picture.jpeg";
import diegoImg from "../images/diego web dev picture.jpeg";
import joseImg from "../images/jose web dev picture.jpeg";

const devTeamMembers = [
  {
    id: 1,
    name: "John Riley",
    position: "Project Manager",
    image: johnRileyImg,
    major: "Computer Engineering",
    year: "Senior",
    description: "Oversees the VENSA website development and architecture.",
    contact: "john.riley@ufl.edu",
  },
  {
    id: 2,
    name: "Estefania Rodriguez",
    position: "Scrum Master",
    image: stefiImg,
    major: "Computer Science",
    year: "Graduate",
    description: "Lead developer who coordinates project + development efforts.",
    contact: "estefani.rodrigu@ufl.edu",
  },
  {
    id: 3,
    name: "Fabio Jorge",
    position: "Full-stack Developer",
    image: vensaLogo,
    major: "Computer Science",
    year: "Senior",
    description: "Developer working across the entire website to deliver complete features.",
    contact: "f.jorgehernandez@ufl.edu",
  },
  {
    id: 4,
    name: "Jose Pulido",
    position: "Full-stack Developer",
    image: joseImg,
    major: "Computer Science",
    year: "Senior",
    description: "Developer working across the entire website to deliver complete features.",
    contact: "Contact info",
  },
  {
    id: 5,
    name: "Andres Arvelo",
    position: "Full-stack Developer",
    image: andyImg,
    major: "Computer Science",
    year: "Freshman",
    description: "Developer working across the entire website to deliver complete features.",
    contact: "aarveloferreira@ufl.edu",
  },
  {
    id: 6,
    name: "Diego Canas",
    position: "Full-stack Developer",
    image: diegoImg,
    major: "Computer Science",
    year: "Freshman",
    description: "Developer working across the entire website to deliver complete features.",
    contact: "diegocanas@ufl.edu",
  },
];

function DevTeamCard({ member }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="exec-card-container">
      <div className={`exec-card ${isFlipped ? "flipped" : ""}`}>
        {/* Front Side */}
        <div className="exec-card-front">
          <img
            src={member.image}
            alt={member.name}
            className="exec-card-image"
          />
          <div className="exec-card-info">
            <h3 className="exec-card-name">{member.name}</h3>
            <p className="exec-card-position">{member.position}</p>
            <button
              className="exec-learn-more"
              onClick={() => setIsFlipped(true)}
            >
              Learn more
            </button>
          </div>
        </div>

        {/* Back Side */}
        <div className="exec-card-back">
          <button
            className="exec-close-btn"
            onClick={() => setIsFlipped(false)}
          >
            ×
          </button>
          <div className="exec-card-back-content">
            <h3 className="exec-back-name">{member.name}</h3>
            <div className="exec-back-details">
              <p>
                <strong>Major:</strong> {member.major}
              </p>
              <p>
                <strong>Year:</strong> {member.year}
              </p>
              <p>
                <strong>Position Description:</strong> {member.description}
              </p>
              <p>
                <strong>Contact:</strong> {member.contact}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DevTeam() {
  return (
    <div className="exec-board-page">
      {/* Hero Banner */}
      <div
        className="hero-banner"
        style={{ backgroundImage: `url(${bannerBg})` }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Development Team</h1>
          <a 
            href="https://forms.gle/SWrJd7EUF5GSYtnG8" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hero-button"
          >
            See an Issue with the Website? Report it to Our Team Here!
          </a>
        </div>
      </div>

      {/* Dev Team Grid */}
      <section className="exec-board-section">
        <div className="exec-board-grid">
          {devTeamMembers.map((member) => (
            <DevTeamCard key={member.id} member={member} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-main-container">
          <div className="footer-content">
            <Link to="/" className="footer-logo-group">
              <img src={ufLogo} alt="UF Logo" className="footer-logo-uf" />
              <div className="footer-divider"></div>
              <div className="footer-logo-text">
                <div className="footer-text-top">Venezuelan</div>
                <div className="footer-text-bottom">Student Association</div>
              </div>
              <img src={vensaLogo} alt="VENSA Logo" className="footer-logo-vensa" />
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
                  href="https://www.google.com/maps/place/University+of+Florida"
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
                  <span>
                    Venezuelan Student Association at<br />the University of Florida
                  </span>
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
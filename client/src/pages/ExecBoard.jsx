import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bannerBg from "../images/VENSA UF Banner.png";
import ufLogo from "../images/VENSA Website UF Logo.png";
const vensaLogo = "/vensa-logo.png";
import instagramIcon from "../images/VENSA Website Instagram.png";
import facebookIcon from "../images/VENSA Website Facebook.png";
import pinIcon from "../images/VENSA Website Pin.png";
import linkedinIcon from "../images/VENSA Website LinkedIn.png";

// Import all executive board member images
import josePeagudaImg from "../images/Jose Peagua.jpg";
import victoriaConsalvoImg from "../images/Victoria Consalvo.jpg";
import alejandroArveloImg from "../images/Alejandro Arvelo.jpg";
import anaCallejaImg from "../images/Ana Calleja.jpg";
import chipiRinconImg from "../images/Chipi Rincon.jpg";
import allisonBonnemaison from "../images/Allison Bonnemaison.jpg";
import carmeloUrdanetaImg from "../images/Carmelo Urdaneta.jpg";
import johnRileyImg from "../images/John Riley.jpg";
import camilaAlmandozImg from "../images/Camila Almandoz.jpg";
import valeriaMaggioloImg from "../images/Valeria Maggiolo.jpeg";
import victoriaMedinaImg from "../images/Victoria Medina.jpg";
import WebDevImg from "../images/arepatech web dev picture.png";

export const boardMembers = [
    {
        id: 1,
        name: "Jose Peaguda",
        position: "President",
        image: josePeagudaImg,
        major: "Biomedical Engineering/Pre-Med",
        year: "Senior",
        description: "Supervises and aids E-Board members and aids Treasurer with budget.",
        contact: "jpeaguda@ufl.edu",
    },
    {
        id: 2,
        name: "Victoria Consalvo",
        position: "Vice President",
        image: victoriaConsalvoImg,
        major: "Biomedical Engineering",
        year: "Senior",
        description: "Assists the President when needed and leads Mentorship/VLC programs.",
        contact: "vconsalvo@ufl.edu",
    },
    {
        id: 3,
        name: "Alejandro Arvelo",
        position: "Treasurer",
        image: alejandroArveloImg,
        major: "Finance",
        year: "Senior",
        description: "Manages the organization's finances and budgets.",
        contact: "alejandro.arvelo@ufl.edu",
    },
    {
        id: 4,
        name: "Ana Calleja",
        position: "Secretary",
        image: anaCallejaImg,
        major: "Psychology",
        year: "Junior",
        description: "Creates and shares GBM slides and calendar and tracks attendance.",
        contact: "anacalleja@ufl.edu",
    },
    {
        id: 5,
        name: "Chipi Rincon",
        position: "Community Manager",
        image: chipiRinconImg,
        major: "Media Production",
        year: "Junior",
        description: "Showcases VENSA through social media management.",
        contact: "dianarincon@ufl.edu",
    },
    {
        id: 6,
        name: "Allison Bonnemaison",
        position: "VP Marketing",
        image: allisonBonnemaison,
        major: "Journalism/International Studies",
        year: "Junior",
        description: "Advertises VENSA with recruitment events and designs the merch.",
        contact: "a.bonnemaison@ufl.edu",
    },
    {
        id: 7,
        name: "Carmelo Urdaneta",
        position: "VP Community Service",
        image: carmeloUrdanetaImg,
        major: "Economics/Political Science",
        year: "Senior",
        description: "Organizes community service initiatives and volunteer events.",
        contact: "carmelourdaneta@ufl.edu",
    },
    {
        id: 8,
        name: "John Riley",
        position: "VP Professional Development",
        image: johnRileyImg,
        major: "Computer Engineering",
        year: "Senior",
        description: "Coordinate events for members' professional growth and networking.",
        contact: "john.riley@ufl.edu",
    },
    {
        id: 9,
        name: "Camila Almandoz",
        position: "VP Athletics",
        image: camilaAlmandozImg,
        major: "Dietetics",
        year: "Junior",
        description: "Coordinates athletics events that foster healthy lifestyles.",
        contact: "camila.almandoz@ufl.edu",
    },
    {
        id: 10,
        name: "Valeria Maggiolo",
        position: "VP Outreach",
        image: valeriaMaggioloImg,
        major: "Pre Professional Biology",
        year: "Senior",
        description: "Chooses the year's affiliate NGO and leads events to raise funds.",
        contact: "vmaggiolo@ufl.edu",
    },
    {
        id: 11,
        name: "Victoria Medina",
        position: "VP Events",
        image: victoriaMedinaImg,
        major: "Psychology (BCN)/Pre Law",
        year: "Junior",
        description: "Coordinates logistics and execution of social events.",
        contact: "vmedinalaguado@ufl.edu",
    },

    {
        id: 12,
        name: "Meet the Dev Team",
        position: "VENSA Website Developers",
        image: WebDevImg,
        major: "Computer Science + Engineering",
        year: "All over",
        description: "Made the Website",
        contact: "Will fix",
    },
];

function ExecutiveBoardCard({ member }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const navigate = useNavigate();

    const handleLearnMore = () => {
        if (member.id === 12) {
            // Navigate to dev team page
            navigate('/dev-team');
        } else {
            setIsFlipped(true);
        }
    };

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
                            onClick={handleLearnMore}
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

export default function ExecBoard() {
    return (
        <div className="exec-board-page">
            {/* Hero Banner */}
            <div
                className="hero-banner"
                style={{ backgroundImage: `url(${bannerBg})` }}
            >
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">Executive Board</h1>
                </div>
            </div>

            {/* Executive Board Grid */}
            <section className="exec-board-section">
                <div className="exec-board-grid">
                    {boardMembers.map((member) => (
                        <ExecutiveBoardCard key={member.id} member={member} />
                    ))}
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
                                    <img
                                        src={instagramIcon}
                                        alt="Instagram"
                                        className="social-icon"
                                    />
                                    <span>@ufvensa</span>
                                </a>
                                <a
                                    href="https://www.facebook.com/uf.vensa/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-item"
                                >
                                    <img
                                        src={facebookIcon}
                                        alt="Facebook"
                                        className="social-icon"
                                    />
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
                                    <img
                                        src={pinIcon}
                                        alt="Location"
                                        className="contact-icon"
                                    />
                                    <span>University of Florida • Gainesville, FL</span>
                                </a>
                                <a
                                    href="https://www.linkedin.com/company/ufvensa"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contact-item"
                                >
                                    <img
                                        src={linkedinIcon}
                                        alt="LinkedIn"
                                        className="contact-icon"
                                    />
                                    <span>
                                        Venezuelan Student Association at
                                        <br />
                                        the University of Florida
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

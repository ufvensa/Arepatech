import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bannerBg from "../images/VENSA UF Banner.png";
import ufLogo from "../images/VENSA Website UF Logo.png";
const vensaLogo = "/vensa-logo.png";
import instagramIcon from "../images/VENSA Website Instagram.png";
import facebookIcon from "../images/VENSA Website Facebook.png";
import pinIcon from "../images/VENSA Website Pin.png";
import linkedinIcon from "../images/VENSA Website LinkedIn.png";
import webDevImg from "../images/arepatech web dev picture.png";

import { boardMembers } from "../data/boardMembers";

const devTeamCard = {
    id: "dev-team",
    name: "Meet the Dev Team",
    position: "VENSA Website Developers",
    image: webDevImg,
    major: "Computer Science and Engineering",
    year: "Multiple class years",
    description: "Meet the student developers who design, build, and maintain VENSA’s website and digital experiences.",
    contact: "Visit the Dev Team page",
    isDevTeam: true,
};

function ExecutiveBoardCard({ member }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const navigate = useNavigate();

    const handleLearnMore = () => {
        if (member.isDevTeam) {
            navigate("/dev-team");
            return;
        }
        setIsFlipped(true);
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
                        style={member.imagePosition ? { objectPosition: member.imagePosition } : undefined}
                    />
                    <div className="exec-card-info">
                        <h3 className="exec-card-name">{member.name}</h3>
                        <p className="exec-card-position">{member.position}</p>
                        <button
                            type="button"
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
                        type="button"
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
                    {[...boardMembers, devTeamCard].map((member) => (
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

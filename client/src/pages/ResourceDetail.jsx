import { useParams, Link } from "react-router-dom";
import bannerBg from "../images/VENSA Website Banner Background.png";
import vensaLogo from "../images/Vensa Website logo.png";
import ufLogo from "../images/VENSA Website UF Logo.png";
import instagramIcon from "../images/Vensa Website Instagram.png";
import facebookIcon from "../images/Vensa Website Facebook.png";
import pinIcon from "../images/Vensa Website Pin.png";
import linkedinIcon from "../images/Vensa Website Linkedin.png";
import { MOCK_RESOURCES } from "./Resources";

export default function ResourceDetail() {
    const { id } = useParams();
    const resourceId = parseInt(id, 10);

    // Find the current resource
    const resource = MOCK_RESOURCES.find(r => r.id === resourceId);

    // If resource not found, show error state
    if (!resource) {
        return (
            <div className="resource-detail-page">
                <div className="resource-detail-not-found">
                    <h1>Resource Not Found</h1>
                    <p>The resource you're looking for doesn't exist.</p>
                    <Link to="/resources" className="back-to-resources-btn">
                        ← Back
                    </Link>
                </div>
            </div>
        );
    }

    // Find related resources (same major, excluding current)
    const relatedResources = MOCK_RESOURCES
        .filter(r => r.id !== resourceId && (r.major === resource.major || resource.major === "All Majors" || r.major === "All Majors"))
        .slice(0, 3);

    return (
        <div className="resource-detail-page">
            {/* Hero Section with Image */}
            <div
                className="resource-detail-hero"
                style={{ backgroundImage: `url(${bannerBg})` }}
            >
                <div className="resource-detail-hero-overlay"></div>
                <div className="resource-detail-hero-content">
                    <div className="resource-detail-image-container">
                        {resource.image ? (
                            <img src={resource.image} alt={resource.title} className="resource-detail-image" />
                        ) : (
                            <div className="resource-detail-placeholder">
                                <img src={vensaLogo} alt="VENSA Logo" className="resource-detail-logo" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <section className="resource-detail-content">
                <div className="resource-detail-container">
                    <div className="resource-detail-header">
                        <Link to="/resources" className="back-link">
                            ← Back
                        </Link>
                        <span className="resource-detail-tag">{resource.major}</span>
                    </div>

                    <h1 className="resource-detail-title">{resource.title}</h1>

                    <div className="resource-detail-meta">
                        <span className="resource-detail-author">By {resource.author}</span>
                        <span className="resource-detail-date">{resource.date}</span>
                    </div>

                    <div className="resource-detail-body">
                        <p>{resource.description}</p>
                        {/* Extended content placeholder - in a real app this would be richer content */}
                        <p>
                            This resource provides valuable insights and practical advice for students
                            navigating their academic and professional journey. Whether you're just
                            starting out or looking to advance your career, the information here can
                            help guide your decisions.
                        </p>
                        <p>
                            For more information or questions about this topic, feel free to reach out
                            to the author or discuss with fellow VENSA members at our next meeting.
                        </p>
                    </div>
                </div>
            </section>

            {/* Related Resources */}
            {relatedResources.length > 0 && (
                <section className="related-resources-section">
                    <div className="related-resources-container">
                        <h2 className="related-resources-title">Related Resources</h2>
                        <div className="related-resources-grid">
                            {relatedResources.map(related => (
                                <Link to={`/resources/${related.id}`} key={related.id} className="related-resource-card">
                                    <div className="related-resource-image">
                                        {related.image ? (
                                            <img src={related.image} alt={related.title} />
                                        ) : (
                                            <div className="related-resource-placeholder">
                                                <img src={vensaLogo} alt="VENSA Logo" className="related-placeholder-logo" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="related-resource-content">
                                        <span className="related-resource-tag">{related.major}</span>
                                        <h3 className="related-resource-title">{related.title}</h3>
                                        <p className="related-resource-author">By {related.author}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

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

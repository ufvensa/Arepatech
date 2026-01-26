import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getResource, getResources } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import bannerBg from "../images/VENSA Website Banner Background.png";
import vensaLogo from "../images/Vensa Website logo.png";
import ufLogo from "../images/VENSA Website UF Logo.png";
import instagramIcon from "../images/Vensa Website Instagram.png";
import facebookIcon from "../images/Vensa Website Facebook.png";
import pinIcon from "../images/Vensa Website Pin.png";
import linkedinIcon from "../images/Vensa Website Linkedin.png";

export default function ResourceDetail() {
    const { id } = useParams();
    const [resource, setResource] = useState(null);
    const [relatedResources, setRelatedResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, loading: authLoading } = useAuth();

    // Fetch resource from Supabase
    useEffect(() => {
        const fetchResource = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getResource(id);
                setResource(data);

                // Fetch related resources (same major tag)
                if (data) {
                    const allResources = await getResources({ majorTag: data.major_tag });
                    const related = allResources
                        .filter(r => r.id !== id)
                        .slice(0, 3);
                    setRelatedResources(related);
                }
            } catch (err) {
                console.error('Error fetching resource:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResource();
    }, [id]);

    // Auth check - redirect to resources page if not logged in
    if (!authLoading && !user) {
        return (
            <div className="resource-detail-page">
                <div className="resource-detail-not-found">
                    <h1>Members Only</h1>
                    <p>Please sign in to view this resource.</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                        <Link to="/profile" className="back-to-resources-btn">
                            Sign In
                        </Link>
                        <Link to="/signup" className="back-to-resources-btn" style={{ backgroundColor: 'white', color: '#1e3a8a', border: '2px solid #1e3a8a' }}>
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (loading || authLoading) {
        return (
            <div className="resource-detail-page">
                <div className="resource-detail-not-found">
                    <p>Loading resource...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !resource) {
        return (
            <div className="resource-detail-page">
                <div className="resource-detail-not-found">
                    <h1>Resource Not Found</h1>
                    <p>{error || "The resource you're looking for doesn't exist."}</p>
                    <Link to="/resources" className="back-to-resources-btn">
                        ← Back
                    </Link>
                </div>
            </div>
        );
    }

    // Format author name and date
    const authorName = resource.author
        ? `${resource.author.first_name} ${resource.author.last_name}`
        : 'VENSA Member';
    const formattedDate = new Date(resource.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

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
                        {resource.image_url ? (
                            <img src={resource.image_url} alt={resource.title} className="resource-detail-image" />
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
                        <span className="resource-detail-tag">{resource.major_tag}</span>
                    </div>

                    <h1 className="resource-detail-title">{resource.title}</h1>

                    <div className="resource-detail-meta">
                        <span className="resource-detail-author">By {authorName}</span>
                        <span className="resource-detail-date">{formattedDate}</span>
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

                    {/* Download Files Section */}
                    {resource.file_url && (
                        <div className="resource-file-download">
                            <h3>Attached Documents</h3>
                            <div className="download-files-list">
                                {(() => {
                                    try {
                                        const files = JSON.parse(resource.file_url);
                                        return files.map((file, index) => (
                                            <a
                                                key={index}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="download-button"
                                            >
                                                📄 {file.name}
                                            </a>
                                        ));
                                    } catch {
                                        // Legacy single URL format
                                        return (
                                            <a
                                                href={resource.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="download-button"
                                            >
                                                📄 Download File
                                            </a>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Related Resources */}
            {relatedResources.length > 0 && (
                <section className="related-resources-section">
                    <div className="related-resources-container">
                        <h2 className="related-resources-title">Related Resources</h2>
                        <div className="related-resources-grid">
                            {relatedResources.map(related => {
                                const relatedAuthor = related.author
                                    ? `${related.author.first_name} ${related.author.last_name}`
                                    : 'VENSA Member';
                                return (
                                    <Link to={`/resources/${related.id}`} key={related.id} className="related-resource-card">
                                        <div className="related-resource-image">
                                            {related.image_url ? (
                                                <img src={related.image_url} alt={related.title} />
                                            ) : (
                                                <div className="related-resource-placeholder">
                                                    <img src={vensaLogo} alt="VENSA Logo" className="related-placeholder-logo" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="related-resource-content">
                                            <span className="related-resource-tag">{related.major_tag}</span>
                                            <h3 className="related-resource-title">{related.title}</h3>
                                            <p className="related-resource-author">By {relatedAuthor}</p>
                                        </div>
                                    </Link>
                                );
                            })}
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

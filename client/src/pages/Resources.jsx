import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getResources, createResource, uploadResourceImage, uploadResourceFile } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import bannerBg from "../images/VENSA Website Banner Background.png";
import vensaLogo from "../images/VENSA Website Logo.png";
import ufLogo from "../images/VENSA Website UF Logo.png";
import instagramIcon from "../images/VENSA Website Instagram.png";
import facebookIcon from "../images/VENSA Website Facebook.png";
import pinIcon from "../images/VENSA Website Pin.png";
import linkedinIcon from "../images/VENSA Website LinkedIn.png";

const MAJORS = [
  "All Majors",
  "Computer Science",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Biology/Pre-Med",
  "Finance",
  "Business Administration",
  "Psychology",
  "Other"
];

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, loading: authLoading } = useAuth();

  // Form state for new resource
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    major: "All Majors",
    imageFile: null,
    documentFiles: []
  });

  // Fetch resources from Supabase
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getResources({
          majorTag: selectedMajor,
          search: searchQuery,
        });
        setResources(data || []);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [selectedMajor, searchQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in to add a resource");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;
      let fileUrls = null;

      // Upload image if provided
      if (newResource.imageFile) {
        imageUrl = await uploadResourceImage(newResource.imageFile);
      }

      // Upload all document files if provided
      if (newResource.documentFiles.length > 0) {
        const uploadedFiles = await Promise.all(
          newResource.documentFiles.map(async (file) => {
            const url = await uploadResourceFile(file);
            return { name: file.name, url };
          })
        );
        fileUrls = JSON.stringify(uploadedFiles);
      }

      // Create resource in database
      const created = await createResource({
        title: newResource.title,
        description: newResource.description,
        major_tag: newResource.major,
        image_url: imageUrl,
        file_url: fileUrls,
      });

      // Add to local state at the beginning
      setResources(prev => [created, ...prev]);

      // Reset form
      setNewResource({ title: "", description: "", major: "All Majors", imageFile: null, documentFiles: [] });
      setShowModal(false);
    } catch (err) {
      console.error('Error creating resource:', err);
      alert("Error creating resource: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show login required screen if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="resources-page">
        {/* Hero Banner */}
        <div
          className="resources-hero"
          style={{ backgroundImage: `url(${bannerBg})` }}
        >
          <div className="resources-hero-overlay"></div>
          <div className="resources-hero-content">
            <h1 className="resources-hero-title">Resources</h1>
            <p className="resources-hero-subtitle">
              Share and discover helpful resources for your academic journey
            </p>
          </div>
        </div>

        {/* Login Required Section */}
        <section className="resources-login-required">
          <div className="resources-login-card">
            <h2 className="resources-login-title">Members Only</h2>
            <p className="resources-login-description">
              Access to VENSA resources is exclusive to registered members.
              Sign in or create an account to view and share helpful academic resources
              with the VENSA community.
            </p>
            <div className="resources-login-buttons">
              <Link to="/profile" className="resources-login-btn primary">
                Sign In
              </Link>
              <Link to="/signup" className="resources-login-btn secondary">
                Create Account
              </Link>
            </div>
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
                  <a href="https://www.instagram.com/ufvensa/?hl=en" target="_blank" rel="noopener noreferrer" className="social-item">
                    <img src={instagramIcon} alt="Instagram" className="social-icon" />
                    <span>@ufvensa</span>
                  </a>
                  <a href="https://www.facebook.com/uf.vensa/" target="_blank" rel="noopener noreferrer" className="social-item">
                    <img src={facebookIcon} alt="Facebook" className="social-icon" />
                    <span>@ufvensa</span>
                  </a>
                </div>
                <div className="footer-contact">
                  <a href="https://www.google.com/maps/place/University+of+Florida" target="_blank" rel="noopener noreferrer" className="contact-item">
                    <img src={pinIcon} alt="Location" className="contact-icon" />
                    <span>University of Florida • Gainesville, FL</span>
                  </a>
                  <a href="https://www.linkedin.com/company/ufvensa" target="_blank" rel="noopener noreferrer" className="contact-item">
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

  return (
    <div className="resources-page">
      {/* Hero Banner */}
      <div
        className="resources-hero"
        style={{ backgroundImage: `url(${bannerBg})` }}
      >
        <div className="resources-hero-overlay"></div>
        <div className="resources-hero-content">
          <h1 className="resources-hero-title">Resources</h1>
          <p className="resources-hero-subtitle">
            Share and discover helpful resources for your academic journey
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <section className="resources-search-section">
        <div className="resources-search-container">
          <div className="resources-search-bar">
            <span className="resources-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="resources-search-input"
            />
          </div>
          {user && (
            <button
              className="add-resource-button"
              onClick={() => setShowModal(true)}
            >
              <span>+</span> Add Resource
            </button>
          )}
          <div className="resources-filter">
            <label className="resources-filter-label">Filter by Major:</label>
            <div className="resources-custom-select">
              <div
                className="resources-select-display"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {selectedMajor === "All" ? "All Majors" : selectedMajor}
                <span className="resources-select-arrow">▼</span>
              </div>
              {showDropdown && (
                <div className="resources-select-dropdown">
                  <div
                    className={`resources-select-option ${selectedMajor === "All" ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedMajor("All");
                      setShowDropdown(false);
                    }}
                  >
                    All Majors
                  </div>
                  {MAJORS.filter(major => major !== "All Majors").map(major => (
                    <div
                      key={major}
                      className={`resources-select-option ${selectedMajor === major ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedMajor(major);
                        setShowDropdown(false);
                      }}
                    >
                      {major}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="resources-grid-section">
        <div className="resources-grid">
          {loading ? (
            <div className="resources-empty">
              <p>Loading resources...</p>
            </div>
          ) : error ? (
            <div className="resources-empty">
              <p style={{ color: '#dc2626' }}>Error loading resources: {error}</p>
            </div>
          ) : resources.length > 0 ? (
            resources.map(resource => {
              const authorName = resource.author
                ? `${resource.author.first_name} ${resource.author.last_name}`
                : 'VENSA Member';
              const formattedDate = new Date(resource.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              });

              return (
                <Link to={`/resources/${resource.id}`} key={resource.id} className="resource-card-link">
                  <div className="resource-card">
                    <div className="resource-card-image">
                      {resource.image_url ? (
                        <img src={resource.image_url} alt={resource.title} />
                      ) : (
                        <div className="resource-card-placeholder">
                          <img src={vensaLogo} alt="VENSA Logo" className="resource-placeholder-logo" />
                        </div>
                      )}
                    </div>
                    <div className="resource-card-content">
                      <div className="resource-card-tags">
                        <span className="resource-card-tag">{resource.major_tag}</span>
                        {resource.file_url && (
                          <span className="resource-card-file-badge">
                            📄 {(() => {
                              try {
                                const files = JSON.parse(resource.file_url);
                                return files.length === 1 ? '1 File' : `${files.length} Files`;
                              } catch {
                                return '1 File';
                              }
                            })()}
                          </span>
                        )}
                      </div>
                      <h3 className="resource-card-title">{resource.title}</h3>
                      <p className="resource-card-description">{resource.description}</p>
                      <div className="resource-card-footer">
                        <span className="resource-card-author">By {authorName}</span>
                        <span className="resource-card-date">{formattedDate}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="resources-empty">
              <span className="resources-empty-icon">📭</span>
              <p>{searchQuery || selectedMajor !== "All" ? "No resources found matching your criteria." : "No resources have been added yet."}</p>
            </div>
          )}
        </div>
      </section>



      {/* Add Resource Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <h2 className="modal-title">Add New Resource</h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="resource-title">Title</label>
                <input
                  type="text"
                  id="resource-title"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="Enter resource title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="resource-description">Description</label>
                <textarea
                  id="resource-description"
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  placeholder="Describe your resource..."
                  rows="4"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="resource-major">Major Tag</label>
                <select
                  id="resource-major"
                  value={newResource.major}
                  onChange={(e) => setNewResource({ ...newResource, major: e.target.value })}
                >
                  {MAJORS.map(major => (
                    <option key={major} value={major}>{major}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="resource-image">Cover Image (optional)</label>
                <input
                  type="file"
                  id="resource-image"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewResource({ ...newResource, imageFile: file });
                    }
                  }}
                  className="file-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="resource-file">Document Files (PDF, DOCX, MD) - Multiple allowed</label>
                <input
                  type="file"
                  id="resource-file"
                  accept=".pdf,.docx,.doc,.md,.txt"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    if (files.length > 0) {
                      setNewResource({ ...newResource, documentFiles: [...newResource.documentFiles, ...files] });
                    }
                  }}
                  className="file-input"
                />
                {newResource.documentFiles.length > 0 && (
                  <div className="files-selected">
                    <p className="files-selected-title">Selected files ({newResource.documentFiles.length}):</p>
                    <ul className="files-selected-list">
                      {newResource.documentFiles.map((file, index) => (
                        <li key={index} className="file-selected-item">
                          <span>{file.name}</span>
                          <button
                            type="button"
                            className="file-remove-btn"
                            onClick={() => {
                              setNewResource({
                                ...newResource,
                                documentFiles: newResource.documentFiles.filter((_, i) => i !== index)
                              });
                            }}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowModal(false)} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="modal-submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
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
import { useState } from "react";
import { Link } from "react-router-dom";
import bannerBg from "../images/VENSA Website Banner Background.png";
import vensaLogo from "../images/Vensa Website logo.png";
import ufLogo from "../images/VENSA Website UF Logo.png";
import instagramIcon from "../images/Vensa Website Instagram.png";
import facebookIcon from "../images/Vensa Website Facebook.png";
import pinIcon from "../images/Vensa Website Pin.png";
import linkedinIcon from "../images/Vensa Website Linkedin.png";
import resourceMechanical from "../images/resource-mechanical-engineering.png";
import resourceLibrary from "../images/resource-library-study.png";
import resourceCS from "../images/resource-cs-internship.png";
import resourceResume from "../images/VENSA Resume Workshop.png";

// Mock data for resources - exported for use by ResourceDetail page
export const MOCK_RESOURCES = [
  {
    id: 1,
    title: "Intro to Mechanical Engineering",
    description: "A comprehensive guide to your first semester courses in mechanical engineering. Covers essential topics like statics, dynamics, and materials science. Perfect for incoming freshmen looking to get ahead.",
    major: "Mechanical Engineering",
    image: resourceMechanical,
    author: "Carlos Mendez",
    date: "January 15, 2026"
  },
  {
    id: 2,
    title: "Best UF Libraries for Studying",
    description: "Discover the quietest and most productive study spots around campus. From Library West to Marston Science Library, find the perfect environment for your study sessions.",
    major: "All Majors",
    image: resourceLibrary,
    author: "Maria Rodriguez",
    date: "January 10, 2026"
  },
  {
    id: 3,
    title: "CS Internship Tips",
    description: "How to land your first tech internship as a computer science student. Covers resume tips, LeetCode prep, behavioral interviews, and networking strategies.",
    major: "Computer Science",
    image: resourceCS,
    author: "Diego Torres",
    date: "January 8, 2026"
  },
  {
    id: 4,
    title: "Pre-Med Path Guide",
    description: "Everything you need to know about the pre-med track at UF. Includes course recommendations, MCAT prep timeline, and research opportunities.",
    major: "Biology/Pre-Med",
    image: null,
    author: "Ana Martinez",
    date: "January 5, 2026"
  },
  {
    id: 5,
    title: "Resume Building 101",
    description: "General resume advice for all majors. Learn how to format your resume, highlight your achievements, and tailor it for different opportunities.",
    major: "All Majors",
    image: resourceResume,
    author: "Luis Garcia",
    date: "January 3, 2026"
  },
  {
    id: 6,
    title: "Finance Career Prep",
    description: "Breaking into investment banking, consulting, and corporate finance. Covers networking, case interviews, and recruiting timelines.",
    major: "Finance",
    image: null,
    author: "Sofia Hernandez",
    date: "December 28, 2025"
  }
];

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
  const [resources, setResources] = useState(MOCK_RESOURCES);

  // Form state for new resource
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    major: "All Majors",
    image: null
  });

  // Filter resources based on search and major
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMajor = selectedMajor === "All" || resource.major === selectedMajor;
    return matchesSearch && matchesMajor;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newId = resources.length + 1;
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    });

    setResources([
      {
        id: newId,
        ...newResource,
        author: "VENSA Member",
        date: today
      },
      ...resources
    ]);

    setNewResource({ title: "", description: "", major: "All Majors", image: null });
    setShowModal(false);
  };

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
          <div className="resources-filter">
            <label htmlFor="major-filter" className="resources-filter-label">Filter by Major:</label>
            <select
              id="major-filter"
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="resources-filter-select"
            >
              <option value="All">All Majors</option>
              {MAJORS.filter(major => major !== "All Majors").map(major => (
                <option key={major} value={major}>{major}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="resources-grid-section">
        <div className="resources-grid">
          {filteredResources.length > 0 ? (
            filteredResources.map(resource => (
              <Link to={`/resources/${resource.id}`} key={resource.id} className="resource-card-link">
                <div className="resource-card">
                  <div className="resource-card-image">
                    {resource.image ? (
                      <img src={resource.image} alt={resource.title} />
                    ) : (
                      <div className="resource-card-placeholder">
                        <img src={vensaLogo} alt="VENSA Logo" className="resource-placeholder-logo" />
                      </div>
                    )}
                  </div>
                  <div className="resource-card-content">
                    <span className="resource-card-tag">{resource.major}</span>
                    <h3 className="resource-card-title">{resource.title}</h3>
                    <p className="resource-card-description">{resource.description}</p>
                    <div className="resource-card-footer">
                      <span className="resource-card-author">By {resource.author}</span>
                      <span className="resource-card-date">{resource.date}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="resources-empty">
              <span className="resources-empty-icon">📭</span>
              <p>No resources found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Add Resource Button (FAB) */}
      <button
        className="add-resource-fab"
        onClick={() => setShowModal(true)}
      >
        <span>+</span> Add Resource
      </button>

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
                <label htmlFor="resource-image">Photo (optional)</label>
                <input
                  type="file"
                  id="resource-image"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setNewResource({ ...newResource, image: event.target.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="file-input"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-submit">
                  Add Resource
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
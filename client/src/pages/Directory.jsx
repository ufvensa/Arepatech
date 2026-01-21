import { useState } from "react";
import { Link } from "react-router-dom";
import bannerBg from "../images/VENSA Website Banner Background.png";
import vensaLogo from "../images/Vensa Website logo.png";
import ufLogo from "../images/VENSA Website UF Logo.png";
import instagramIcon from "../images/Vensa Website Instagram.png";
import facebookIcon from "../images/Vensa Website Facebook.png";
import pinIcon from "../images/Vensa Website Pin.png";
import linkedinIcon from "../images/Vensa Website Linkedin.png";

// Mock member data with email
const MOCK_MEMBERS = [
    // E-Board Members
    { id: 1, name: "Jose Peaguda", status: "eboard", major: "Biomedical Engineering", year: "Senior", attendanceRate: 100, workplace: null, email: "jose.peaguda@ufl.edu" },
    { id: 2, name: "Victoria Consalvo", status: "eboard", major: "Biomedical Engineering", year: "Senior", attendanceRate: 95, workplace: null, email: "v.consalvo@ufl.edu" },
    { id: 3, name: "Alejandro Arvelo", status: "eboard", major: "Finance", year: "Senior", attendanceRate: 100, workplace: "Goldman Sachs", email: "a.arvelo@ufl.edu" },
    { id: 4, name: "Ana Calleja", status: "eboard", major: "Psychology", year: "Junior", attendanceRate: 90, workplace: null, email: "ana.calleja@ufl.edu" },
    { id: 5, name: "Chipi Rincon", status: "eboard", major: "Media Production", year: "Junior", attendanceRate: 85, workplace: null, email: "chipi.rincon@ufl.edu" },
    { id: 6, name: "Allison Bonnemaison", status: "eboard", major: "Journalism", year: "Junior", attendanceRate: 95, workplace: null, email: "a.bonnemaison@ufl.edu" },
    { id: 7, name: "Carmelo Urdaneta", status: "eboard", major: "Economics", year: "Senior", attendanceRate: 88, workplace: "Deloitte", email: "c.urdaneta@ufl.edu" },
    { id: 8, name: "John Riley", status: "eboard", major: "Computer Engineering", year: "Senior", attendanceRate: 92, workplace: "Microsoft", email: "john.riley@ufl.edu" },
    { id: 9, name: "Camila Almandoz", status: "eboard", major: "Dietetics", year: "Junior", attendanceRate: 90, workplace: null, email: "c.almandoz@ufl.edu" },
    { id: 10, name: "Valeria Maggiolo", status: "eboard", major: "Biology", year: "Senior", attendanceRate: 87, workplace: null, email: "v.maggiolo@ufl.edu" },
    { id: 11, name: "Victoria Medina", status: "eboard", major: "Psychology", year: "Junior", attendanceRate: 93, workplace: null, email: "v.medina@ufl.edu" },

    // Regular Members
    { id: 12, name: "Carlos Mendez", status: "member", major: "Mechanical Engineering", year: "Sophomore", attendanceRate: 75, workplace: null, email: "carlos.mendez@ufl.edu" },
    { id: 13, name: "Maria Rodriguez", status: "member", major: "Computer Science", year: "Junior", attendanceRate: 82, workplace: "Amazon", email: "maria.rodriguez@ufl.edu" },
    { id: 14, name: "Diego Torres", status: "member", major: "Computer Science", year: "Senior", attendanceRate: 68, workplace: "Google", email: "diego.torres@ufl.edu" },
    { id: 15, name: "Sofia Hernandez", status: "member", major: "Finance", year: "Junior", attendanceRate: 90, workplace: "JP Morgan", email: "sofia.hernandez@ufl.edu" },
    { id: 16, name: "Luis Garcia", status: "member", major: "Business Administration", year: "Sophomore", attendanceRate: 55, workplace: null, email: "luis.garcia@ufl.edu" },
    { id: 17, name: "Isabella Martinez", status: "member", major: "Biology", year: "Freshman", attendanceRate: 78, workplace: null, email: "isabella.martinez@ufl.edu" },
    { id: 18, name: "Gabriel Sanchez", status: "member", major: "Civil Engineering", year: "Junior", attendanceRate: 65, workplace: "Turner Construction", email: "g.sanchez@ufl.edu" },
    { id: 19, name: "Valentina Lopez", status: "member", major: "Psychology", year: "Sophomore", attendanceRate: 88, workplace: null, email: "v.lopez@ufl.edu" },
    { id: 20, name: "Sebastian Ramirez", status: "member", major: "Economics", year: "Senior", attendanceRate: 72, workplace: "EY", email: "s.ramirez@ufl.edu" },
    { id: 21, name: "Camila Gutierrez", status: "member", major: "Marketing", year: "Junior", attendanceRate: 80, workplace: null, email: "c.gutierrez@ufl.edu" },
    { id: 22, name: "Andres Morales", status: "member", major: "Electrical Engineering", year: "Sophomore", attendanceRate: 45, workplace: null, email: "a.morales@ufl.edu" },
    { id: 23, name: "Paula Fernandez", status: "member", major: "Journalism", year: "Freshman", attendanceRate: 92, workplace: null, email: "p.fernandez@ufl.edu" },

    // Alumni
    { id: 24, name: "Ricardo Blanco", status: "alumni", major: "Finance", year: "Class of 2024", attendanceRate: 95, workplace: "Morgan Stanley", email: "ricardo.blanco@alumni.ufl.edu" },
    { id: 25, name: "Carolina Vargas", status: "alumni", major: "Computer Science", year: "Class of 2023", attendanceRate: 88, workplace: "Meta", email: "carolina.vargas@alumni.ufl.edu" },
    { id: 26, name: "Fernando Ortiz", status: "alumni", major: "Mechanical Engineering", year: "Class of 2024", attendanceRate: 82, workplace: "SpaceX", email: "fernando.ortiz@alumni.ufl.edu" },
    { id: 27, name: "Andrea Castillo", status: "alumni", major: "Business Administration", year: "Class of 2022", attendanceRate: 78, workplace: "McKinsey", email: "andrea.castillo@alumni.ufl.edu" },
    { id: 28, name: "Miguel Paredes", status: "alumni", major: "Biomedical Engineering", year: "Class of 2023", attendanceRate: 90, workplace: "Medtronic", email: "miguel.paredes@alumni.ufl.edu" },
];

const STATUS_OPTIONS = ["all", "eboard", "member", "alumni"];

function MemberCard({ member, onClick }) {
    const getStatusColor = (status) => {
        switch (status) {
            case "eboard": return "#1e3a8a";
            case "member": return "#059669";
            case "alumni": return "#7c3aed";
            default: return "#6b7280";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "eboard": return "E-Board";
            case "member": return "Member";
            case "alumni": return "Alumni";
            default: return status;
        }
    };

    const getAttendanceColor = (rate) => {
        if (rate >= 85) return "#059669";
        if (rate >= 60) return "#d97706";
        return "#dc2626";
    };

    return (
        <div className="directory-card" onClick={onClick}>
            <div className="directory-card-avatar">
                <img src={vensaLogo} alt={member.name} className="directory-avatar-img" />
            </div>
            <div className="directory-card-info">
                <h3 className="directory-card-name">{member.name}</h3>
                <p className="directory-card-major">{member.major}</p>
                <p className="directory-card-year">{member.year}</p>
                {member.workplace && (
                    <p className="directory-card-workplace">{member.workplace}</p>
                )}
            </div>
            <div className="directory-card-badges">
                <span
                    className="directory-status-badge"
                    style={{ backgroundColor: getStatusColor(member.status) }}
                >
                    {getStatusLabel(member.status)}
                </span>
                <div className="directory-attendance">
                    <span className="attendance-label">Attendance</span>
                    <div className="attendance-bar">
                        <div
                            className="attendance-fill"
                            style={{
                                width: `${member.attendanceRate}%`,
                                backgroundColor: getAttendanceColor(member.attendanceRate)
                            }}
                        ></div>
                    </div>
                    <span
                        className="attendance-rate"
                        style={{ color: getAttendanceColor(member.attendanceRate) }}
                    >
                        {member.attendanceRate}%
                    </span>
                </div>
            </div>
        </div>
    );
}

function MemberModal({ member, onClose }) {
    if (!member) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case "eboard": return "#1e3a8a";
            case "member": return "#059669";
            case "alumni": return "#7c3aed";
            default: return "#6b7280";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "eboard": return "E-Board";
            case "member": return "Member";
            case "alumni": return "Alumni";
            default: return status;
        }
    };

    const getAttendanceColor = (rate) => {
        if (rate >= 85) return "#059669";
        if (rate >= 60) return "#d97706";
        return "#dc2626";
    };

    return (
        <div className="member-modal-overlay" onClick={onClose}>
            <div className="member-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="member-modal-close" onClick={onClose}>×</button>

                <div className="member-modal-header">
                    <div className="member-modal-avatar">
                        <img src={vensaLogo} alt={member.name} />
                    </div>
                    <div className="member-modal-title">
                        <h2>{member.name}</h2>
                        <span
                            className="member-modal-status"
                            style={{ backgroundColor: getStatusColor(member.status) }}
                        >
                            {getStatusLabel(member.status)}
                        </span>
                    </div>
                </div>

                <div className="member-modal-details">
                    <div className="member-detail-row">
                        <span className="detail-label">Major</span>
                        <span className="detail-value">{member.major}</span>
                    </div>
                    <div className="member-detail-row">
                        <span className="detail-label">Year</span>
                        <span className="detail-value">{member.year}</span>
                    </div>
                    <div className="member-detail-row">
                        <span className="detail-label">Email</span>
                        <a href={`mailto:${member.email}`} className="detail-value detail-email">{member.email}</a>
                    </div>
                    {member.workplace && (
                        <div className="member-detail-row">
                            <span className="detail-label">Workplace</span>
                            <span className="detail-value">{member.workplace}</span>
                        </div>
                    )}
                    <div className="member-detail-row">
                        <span className="detail-label">Attendance</span>
                        <div className="modal-attendance">
                            <div className="attendance-bar modal-attendance-bar">
                                <div
                                    className="attendance-fill"
                                    style={{
                                        width: `${member.attendanceRate}%`,
                                        backgroundColor: getAttendanceColor(member.attendanceRate)
                                    }}
                                ></div>
                            </div>
                            <span
                                className="attendance-rate"
                                style={{ color: getAttendanceColor(member.attendanceRate) }}
                            >
                                {member.attendanceRate}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Directory() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedMember, setSelectedMember] = useState(null);

    const filteredMembers = MOCK_MEMBERS.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.major.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === "all" || member.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const memberCounts = {
        all: MOCK_MEMBERS.length,
        eboard: MOCK_MEMBERS.filter(m => m.status === "eboard").length,
        member: MOCK_MEMBERS.filter(m => m.status === "member").length,
        alumni: MOCK_MEMBERS.filter(m => m.status === "alumni").length,
    };

    return (
        <div className="directory-page">
            {/* Hero Banner */}
            <div
                className="directory-hero"
                style={{ backgroundImage: `url(${bannerBg})` }}
            >
                <div className="directory-hero-overlay"></div>
                <div className="directory-hero-content">
                    <h1 className="directory-hero-title">Member Directory</h1>
                    <p className="directory-hero-subtitle">
                        Connect with {MOCK_MEMBERS.length} VENSA members, E-Board, and alumni
                    </p>
                </div>
            </div>

            {/* Search and Filter Section */}
            <section className="directory-filter-section">
                <div className="directory-filter-container">
                    <div className="directory-search-bar">
                        <input
                            type="text"
                            placeholder="Search by name or major..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="directory-search-input"
                        />
                    </div>
                    <div className="directory-status-filters">
                        {STATUS_OPTIONS.map(status => (
                            <button
                                key={status}
                                className={`directory-filter-btn ${selectedStatus === status ? "active" : ""}`}
                                onClick={() => setSelectedStatus(status)}
                            >
                                {status === "all" ? "All" : status === "eboard" ? "E-Board" : status.charAt(0).toUpperCase() + status.slice(1)}
                                <span className="filter-count">{memberCounts[status]}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Members Grid */}
            <section className="directory-grid-section">
                <div className="directory-grid">
                    {filteredMembers.length > 0 ? (
                        filteredMembers.map(member => (
                            <MemberCard
                                key={member.id}
                                member={member}
                                onClick={() => setSelectedMember(member)}
                            />
                        ))
                    ) : (
                        <div className="directory-empty">
                            <p>No members found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Member Modal */}
            {selectedMember && (
                <MemberModal
                    member={selectedMember}
                    onClose={() => setSelectedMember(null)}
                />
            )}

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

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProfiles, adminDeleteUser } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { boardMembers } from "../data/boardMembers";
import bannerBg from "../images/VENSA UF Banner.png";
const vensaLogo = "/vensa-logo.png";
import ufLogo from "../images/VENSA Website UF Logo.png";
import instagramIcon from "../images/VENSA Website Instagram.png";
import facebookIcon from "../images/VENSA Website Facebook.png";
import pinIcon from "../images/VENSA Website Pin.png";
import linkedinIcon from "../images/VENSA Website LinkedIn.png";

const STATUS_OPTIONS = ["all", "eboard", "member", "alumni"];

// Get list of e-board member names (exclude dev team card with id 12)
const eboardNames = boardMembers
    .filter(member => member.id !== 12)
    .map(member => member.name.toLowerCase());

// Helper function to check if a member is on the e-board
const isEboardMember = (firstName, lastName) => {
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    return eboardNames.includes(fullName);
};

// Helper function to get actual status based on e-board name or year
const getActualStatus = (member) => {
    // E-board members take priority
    if (isEboardMember(member.first_name, member.last_name)) {
        return 'eboard';
    }
    // If year is Alumni, they get alumni status
    if (member.year === 'Alumni') {
        return 'alumni';
    }
    // Otherwise use their profile status
    return member.status;
};

// Helper functions for status colors and labels
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

function MemberCard({ member, onClick }) {
    const displayName = `${member.first_name} ${member.last_name}`;
    const attendanceRate = member.attendance_rate ?? 100;

    // Get actual status based on e-board name matching or alumni year
    const actualStatus = getActualStatus(member);

    return (
        <div className="directory-card" onClick={onClick}>
            <div className="directory-card-avatar">
                {member.avatar_url ? (
                    <img src={member.avatar_url} alt={displayName} className="directory-avatar-img" />
                ) : (
                    <img src={vensaLogo} alt={displayName} className="directory-avatar-img" />
                )}
            </div>
            <div className="directory-card-info">
                <h3 className="directory-card-name">{displayName}</h3>
                <p className="directory-card-major">{member.major || 'Undeclared'}</p>
                <p className="directory-card-year">{member.year || 'Unknown'}</p>
                {member.workplace && (
                    <p className="directory-card-workplace">{member.workplace}</p>
                )}
            </div>
            <div className="directory-card-badges">
                <span
                    className="directory-status-badge"
                    style={{ backgroundColor: getStatusColor(actualStatus) }}
                >
                    {getStatusLabel(actualStatus)}
                </span>
            </div>
        </div>
    );
}

function MemberModal({ member, onClose, onDelete, isUserAdmin }) {
    if (!member) return null;

    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const displayName = `${member.first_name} ${member.last_name}`;
    const attendanceRate = member.attendance_rate ?? 100;

    // Get actual status based on e-board name matching or alumni year
    const actualStatus = getActualStatus(member);

    const handleDeleteClick = () => {
        setShowConfirmDelete(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(member);
            onClose();
        } catch (error) {
            console.error('Error deleting member:', error);
            alert('Failed to delete member: ' + error.message);
        } finally {
            setIsDeleting(false);
            setShowConfirmDelete(false);
        }
    };

    return (
        <div className="member-modal-overlay" onClick={onClose}>
            <div className="member-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="member-modal-close" onClick={onClose}>×</button>

                <div className="member-modal-header">
                    <div className="member-modal-avatar">
                        {member.avatar_url ? (
                            <img src={member.avatar_url} alt={displayName} />
                        ) : (
                            <img src={vensaLogo} alt={displayName} />
                        )}
                    </div>
                    <div className="member-modal-title">
                        <h2>{displayName}</h2>
                        <span
                            className="member-modal-status"
                            style={{ backgroundColor: getStatusColor(actualStatus) }}
                        >
                            {getStatusLabel(actualStatus)}
                        </span>
                    </div>
                </div>

                <div className="member-modal-details">
                    <div className="member-detail-row">
                        <span className="detail-label">Major</span>
                        <span className="detail-value">{member.major || 'Undeclared'}</span>
                    </div>
                    <div className="member-detail-row">
                        <span className="detail-label">Year</span>
                        <span className="detail-value">{member.year || 'Unknown'}</span>
                    </div>
                    {member.workplace && (
                        <div className="member-detail-row">
                            <span className="detail-label">Workplace</span>
                            <span className="detail-value">{member.workplace}</span>
                        </div>
                    )}
                    {member.linkedin_url && (
                        <div className="member-detail-row">
                            <span className="detail-label">LinkedIn</span>
                            <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="detail-value detail-email">
                                View Profile
                            </a>
                        </div>
                    )}
                    <div className="member-detail-row">
                        <span className="detail-label">Attendance</span>
                        <div className="modal-attendance">
                            <div className="attendance-bar modal-attendance-bar">
                                <div
                                    className="attendance-fill"
                                    style={{
                                        width: `${attendanceRate}%`,
                                        backgroundColor: getAttendanceColor(attendanceRate)
                                    }}
                                ></div>
                            </div>
                            <span
                                className="attendance-rate"
                                style={{ color: getAttendanceColor(attendanceRate) }}
                            >
                                {attendanceRate}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Admin Delete Button */}
                {isUserAdmin && !showConfirmDelete && (
                    <div className="member-modal-admin-actions">
                        <button
                            className="member-delete-button"
                            onClick={handleDeleteClick}
                            disabled={isDeleting}
                        >
                            Remove Member
                        </button>
                    </div>
                )}

                {/* Confirmation Dialog */}
                {showConfirmDelete && (
                    <div className="member-modal-confirm-delete">
                        <p className="confirm-delete-text">
                            Are you sure you want to remove <strong>{displayName}</strong> from the directory?
                            This will delete their account and ban their email.
                        </p>
                        <div className="confirm-delete-buttons">
                            <button
                                className="confirm-delete-cancel"
                                onClick={() => setShowConfirmDelete(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="confirm-delete-confirm"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Removing...' : 'Yes, Remove'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Directory() {
    const { isAdmin } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedMember, setSelectedMember] = useState(null);

    // Fetch members from Supabase
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getProfiles();
                setMembers(data || []);
            } catch (err) {
                console.error('Error fetching members:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    // Handle member deletion (admin only)
    const handleDeleteMember = async (member) => {
        try {
            // Call the admin delete function
            await adminDeleteUser(member.id, true, 'Removed by admin');

            // Remove from local state
            setMembers(prevMembers => prevMembers.filter(m => m.id !== member.id));

            // Close modal
            setSelectedMember(null);
        } catch (err) {
            console.error('Error deleting member:', err);
            throw err; // Re-throw to be caught by modal
        }
    };

    // Filter members based on search and status
    const filteredMembers = members.filter(member => {
        const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
        const majorLower = (member.major || '').toLowerCase();
        const searchLower = searchQuery.toLowerCase();

        // Determine actual status
        const actualStatus = getActualStatus(member);

        const matchesSearch = fullName.includes(searchLower) || majorLower.includes(searchLower);
        const matchesStatus = selectedStatus === "all" || actualStatus === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    // Calculate member counts (using actual status based on e-board name or year)
    const memberCounts = {
        all: members.length,
        eboard: members.filter(m => getActualStatus(m) === 'eboard').length,
        member: members.filter(m => getActualStatus(m) === 'member').length,
        alumni: members.filter(m => getActualStatus(m) === 'alumni').length,
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
                        Connect with {members.length} VENSA members, E-Board, and alumni
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
                    {loading ? (
                        <div className="directory-empty">
                            <p>Loading members...</p>
                        </div>
                    ) : error ? (
                        <div className="directory-empty">
                            <p style={{ color: '#dc2626' }}>Error loading members: {error}</p>
                        </div>
                    ) : filteredMembers.length > 0 ? (
                        filteredMembers.map(member => (
                            <MemberCard
                                key={member.id}
                                member={member}
                                onClick={() => setSelectedMember(member)}
                            />
                        ))
                    ) : (
                        <div className="directory-empty">
                            <p>{members.length === 0 ? "No members have signed up yet." : "No members found matching your criteria."}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Member Modal */}
            {selectedMember && (
                <MemberModal
                    member={selectedMember}
                    onClose={() => setSelectedMember(null)}
                    onDelete={handleDeleteMember}
                    isUserAdmin={isAdmin()}
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
                        © Copyright 2026. All Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

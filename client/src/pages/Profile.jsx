import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile, uploadAvatar } from "../lib/supabase";
import { getPendingAvatar, clearPendingAvatar } from "../lib/pendingAvatar";
import { checkFormProfanity, profanityErrorMessage } from "../lib/profanityFilter";
import { boardMembers } from "./ExecBoard";
import ufLogo from "../images/VENSA Website UF Logo.png";
const vensaLogo = "/vensa-logo.png";
import instagramIcon from "../images/VENSA Website Instagram.png";
import facebookIcon from "../images/VENSA Website Facebook.png";
import pinIcon from "../images/VENSA Website Pin.png";
import linkedinIcon from "../images/VENSA Website LinkedIn.png";

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
const getActualStatus = (profile) => {
    if (!profile) return 'member';
    // E-board members take priority
    if (isEboardMember(profile.first_name, profile.last_name)) {
        return 'eboard';
    }
    // If year is Alumni, they get alumni status
    if (profile.year === 'Alumni') {
        return 'alumni';
    }
    // Otherwise use their profile status
    return profile.status;
};

// Edit Profile Form Component
function EditProfileForm({ profile, onSave, onCancel }) {
  // Format date to YYYY-MM-DD for the date input, avoiding timezone issues
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    // Just take the first 10 characters (YYYY-MM-DD) from the date string
    // This avoids any timezone conversion issues
    return dateStr.split('T')[0];
  };

  const [formData, setFormData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    major: profile?.major || "",
    year: profile?.year || "",
    workplace: profile?.workplace || "",
    bio: profile?.bio || "",
    linkedin_url: profile?.linkedin_url || "",
    date_of_birth: formatDateForInput(profile?.date_of_birth) || "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(profile?.avatar_url || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Profile picture must be less than 5MB");
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Check for inappropriate language
    const profanityCheck = checkFormProfanity({
      first_name: formData.first_name,
      last_name: formData.last_name,
      major: formData.major,
      workplace: formData.workplace,
      bio: formData.bio,
    });
    if (!profanityCheck.clean) {
      setError(profanityErrorMessage(profanityCheck.field));
      setSaving(false);
      return;
    }

    try {
      // Upload profile picture first if one was selected
      if (profilePicture) {
        try {
          await uploadAvatar(profile.id, profilePicture);
        } catch (avatarErr) {
          console.error('Avatar upload failed:', avatarErr);
          setError(`Profile picture upload failed: ${avatarErr.message}`);
          setSaving(false);
          return;
        }
      }
      await onSave(formData);
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-edit-form">
      {error && (
        <div className="profile-error-banner">
          {error}
        </div>
      )}

      <div className="profile-edit-field profile-edit-field-full" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <label>Profile Picture</label>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="profile-picture-input" style={{
            position: 'relative',
            cursor: 'pointer',
            display: 'inline-block'
          }}>
            {profilePicturePreview ? (
              <img
                src={profilePicturePreview}
                alt="Profile"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #0021A5',
                  transition: 'opacity 0.3s'
                }}
                onMouseOver={(e) => e.target.style.opacity = '0.7'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
              />
            ) : (
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #0021A5',
                transition: 'background-color 0.3s',
                overflow: 'hidden'
              }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}>
                <img
                  src={vensaLogo}
                  alt="VENSA Logo"
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'contain'
                  }}
                />
              </div>
            )}
            <div style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              backgroundColor: '#0021A5',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="20" height="20">
                <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
            </div>
          </label>
          <input
            id="profile-picture-input"
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            style={{ display: 'none' }}
          />
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>
            Click to change profile picture
          </p>
        </div>
      </div>

      <div className="profile-edit-grid">
        <div className="profile-edit-field">
          <label>First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="profile-edit-field">
          <label>Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="profile-edit-field">
          <label>Major</label>
          <select name="major" value={formData.major} onChange={handleChange}>
            <option value="">Select Major</option>
            <option value="Accounting">Accounting</option>
            <option value="Advertising">Advertising</option>
            <option value="Aerospace Engineering">Aerospace Engineering</option>
            <option value="African American Studies">African American Studies</option>
            <option value="Agricultural and Biological Engineering">Agricultural and Biological Engineering</option>
            <option value="Agricultural Education and Communication">Agricultural Education and Communication</option>
            <option value="Animal Sciences">Animal Sciences</option>
            <option value="Anthropology">Anthropology</option>
            <option value="Applied Physiology and Kinesiology">Applied Physiology and Kinesiology</option>
            <option value="Architecture">Architecture</option>
            <option value="Art">Art</option>
            <option value="Art History">Art History</option>
            <option value="Astronomy and Astrophysics">Astronomy and Astrophysics</option>
            <option value="Biochemistry and Molecular Biology">Biochemistry and Molecular Biology</option>
            <option value="Biology">Biology</option>
            <option value="Biomedical Engineering">Biomedical Engineering</option>
            <option value="Botany">Botany</option>
            <option value="Business Administration">Business Administration</option>
            <option value="Chemical Engineering">Chemical Engineering</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Classical Studies">Classical Studies</option>
            <option value="Communication Sciences and Disorders">Communication Sciences and Disorders</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Construction Management">Construction Management</option>
            <option value="Criminology">Criminology</option>
            <option value="Dance">Dance</option>
            <option value="Data Science">Data Science</option>
            <option value="Dietetics">Dietetics</option>
            <option value="Digital Arts and Sciences">Digital Arts and Sciences</option>
            <option value="Economics">Economics</option>
            <option value="Education Sciences">Education Sciences</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="English">English</option>
            <option value="Entomology and Nematology">Entomology and Nematology</option>
            <option value="Environmental Engineering">Environmental Engineering</option>
            <option value="Environmental Science">Environmental Science</option>
            <option value="Family, Youth and Community Sciences">Family, Youth and Community Sciences</option>
            <option value="Finance">Finance</option>
            <option value="Food and Resource Economics">Food and Resource Economics</option>
            <option value="Food Science and Human Nutrition">Food Science and Human Nutrition</option>
            <option value="Forest Resources and Conservation">Forest Resources and Conservation</option>
            <option value="French and Francophone Studies">French and Francophone Studies</option>
            <option value="Geography">Geography</option>
            <option value="Geology">Geology</option>
            <option value="Geomatics">Geomatics</option>
            <option value="German">German</option>
            <option value="Graphic Design">Graphic Design</option>
            <option value="Health Education and Behavior">Health Education and Behavior</option>
            <option value="Health Science">Health Science</option>
            <option value="History">History</option>
            <option value="Horticultural Science">Horticultural Science</option>
            <option value="Industrial and Systems Engineering">Industrial and Systems Engineering</option>
            <option value="Information Systems">Information Systems</option>
            <option value="Interior Design">Interior Design</option>
            <option value="International Studies">International Studies</option>
            <option value="Jewish Studies">Jewish Studies</option>
            <option value="Journalism">Journalism</option>
            <option value="Landscape Architecture">Landscape Architecture</option>
            <option value="Linguistics">Linguistics</option>
            <option value="Management">Management</option>
            <option value="Marine Sciences">Marine Sciences</option>
            <option value="Marketing">Marketing</option>
            <option value="Materials Science and Engineering">Materials Science and Engineering</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Microbiology and Cell Science">Microbiology and Cell Science</option>
            <option value="Music">Music</option>
            <option value="Music Education">Music Education</option>
            <option value="Natural Resource Conservation">Natural Resource Conservation</option>
            <option value="Nuclear Engineering">Nuclear Engineering</option>
            <option value="Nursing">Nursing</option>
            <option value="Nutritional Sciences">Nutritional Sciences</option>
            <option value="Pharmaceutical Sciences">Pharmaceutical Sciences</option>
            <option value="Philosophy">Philosophy</option>
            <option value="Physics">Physics</option>
            <option value="Plant Science">Plant Science</option>
            <option value="Political Science">Political Science</option>
            <option value="Portuguese">Portuguese</option>
            <option value="Psychology">Psychology</option>
            <option value="Public Health">Public Health</option>
            <option value="Public Relations">Public Relations</option>
            <option value="Religion">Religion</option>
            <option value="Sociology">Sociology</option>
            <option value="Soil and Water Sciences">Soil and Water Sciences</option>
            <option value="Spanish">Spanish</option>
            <option value="Spanish and Portuguese">Spanish and Portuguese</option>
            <option value="Sport Management">Sport Management</option>
            <option value="Statistics">Statistics</option>
            <option value="Sustainability and the Built Environment">Sustainability and the Built Environment</option>
            <option value="Sustainability Studies">Sustainability Studies</option>
            <option value="Telecommunication">Telecommunication</option>
            <option value="Theatre">Theatre</option>
            <option value="Theatre Performance">Theatre Performance</option>
            <option value="Theatre Production">Theatre Production</option>
            <option value="Tourism, Hospitality and Event Management">Tourism, Hospitality and Event Management</option>
            <option value="Wildlife Ecology and Conservation">Wildlife Ecology and Conservation</option>
            <option value="Women's Studies">Women's Studies</option>
            <option value="Zoology">Zoology</option>
            <option value="Undeclared">Undeclared</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="profile-edit-field">
          <label>Year</label>
          <select name="year" value={formData.year} onChange={handleChange}>
            <option value="">Select Year</option>
            <option value="Freshman">Freshman</option>
            <option value="Sophomore">Sophomore</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
            <option value="Graduate">Graduate</option>
            <option value="Alumni">Alumni</option>
          </select>
        </div>

        <div className="profile-edit-field">
          <label>Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
          />
        </div>

        <div className="profile-edit-field">
          <label>Workplace</label>
          <input
            type="text"
            name="workplace"
            value={formData.workplace}
            onChange={handleChange}
            placeholder="Company or organization"
          />
        </div>

        <div className="profile-edit-field">
          <label>LinkedIn URL</label>
          <input
            type="url"
            name="linkedin_url"
            value={formData.linkedin_url}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        <div className="profile-edit-field profile-edit-field-full">
          <label>Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows={4}
          />
        </div>
      </div>

      <div className="profile-edit-actions">
        <button type="button" onClick={onCancel} className="profile-btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="profile-btn-primary">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

// User Profile Display Component (shown when logged in)
function UserProfileView({ profile, onEdit, onLogout }) {
  const actualStatus = getActualStatus(profile);

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
      default: return "Member";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    // Parse the date as YYYY-MM-DD to avoid timezone issues
    const [year, month, day] = dateStr.split('T')[0].split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="profile-modern-card">
      {/* Header Section */}
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder" style={{ overflow: 'hidden' }}>
              <img src={vensaLogo} alt="VENSA Logo" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
            </div>
          )}
        </div>

        <div className="profile-header-info">
          <h1 className="profile-name">
            {profile?.first_name} {profile?.last_name}
          </h1>

          <span
            className="profile-status-badge"
            style={{ backgroundColor: getStatusColor(actualStatus) }}
          >
            {getStatusLabel(actualStatus)}
          </span>
        </div>

        <button onClick={onEdit} className="profile-edit-btn">
          Edit Profile
        </button>
      </div>

      {/* Bio Section */}
      {profile?.bio && (
        <div className="profile-section">
          <p className="profile-bio">{profile.bio}</p>
        </div>
      )}

      {/* Info Grid */}
      <div className="profile-info-grid">
        <div className="profile-info-item">
          <span className="profile-info-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
              <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
            </svg>
          </span>
          <div>
            <span className="profile-info-label">Email</span>
            <span className="profile-info-value">{profile?.email || 'Not set'}</span>
          </div>
        </div>

        <div className="profile-info-item">
          <span className="profile-info-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
              <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
              <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
            </svg>
          </span>
          <div>
            <span className="profile-info-label">Major</span>
            <span className="profile-info-value">{profile?.major || 'Not set'}</span>
          </div>
        </div>

        <div className="profile-info-item">
          <span className="profile-info-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
            </svg>
          </span>
          <div>
            <span className="profile-info-label">Year</span>
            <span className="profile-info-value">{profile?.year || 'Not set'}</span>
          </div>
        </div>

        <div className="profile-info-item">
          <span className="profile-info-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 000-1.5h-15zM9 6a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm-.75 3.75A.75.75 0 019 9h1.5a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM9 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm3.75-5.25A.75.75 0 0113.5 6H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM13.5 9a.75.75 0 000 1.5H15A.75.75 0 0015 9h-1.5zm-.75 3.75a.75.75 0 01.75-.75H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM9 19.5v-2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5A.75.75 0 019 19.5z" clipRule="evenodd" />
            </svg>
          </span>
          <div>
            <span className="profile-info-label">Workplace</span>
            <span className="profile-info-value">{profile?.workplace || 'Not set'}</span>
          </div>
        </div>

        {profile?.date_of_birth && (
          <div className="profile-info-item">
            <span className="profile-info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M15 1.784l-.796.796a1.125 1.125 0 101.591 0L15 1.784zM12 1.784l-.796.796a1.125 1.125 0 101.591 0L12 1.784zM9 1.784l-.796.796a1.125 1.125 0 101.591 0L9 1.784zM9.75 7.547c.498-.02.998-.035 1.5-.042V6.75a.75.75 0 011.5 0v.755c.502.007 1.002.021 1.5.042V6.75a.75.75 0 011.5 0v.88l.307.022c1.55.117 2.693 1.427 2.693 2.946v1.018a62.182 62.182 0 00-13.5 0v-1.018c0-1.519 1.143-2.829 2.693-2.946l.307-.022v-.88a.75.75 0 011.5 0v.797zM12 12.75c-2.472 0-4.9.184-7.274.54-1.454.217-2.476 1.482-2.476 2.916v.384a4.104 4.104 0 012.585.364 2.605 2.605 0 002.33 0 4.104 4.104 0 013.67 0 2.605 2.605 0 002.33 0 4.104 4.104 0 013.67 0 2.605 2.605 0 002.33 0 4.104 4.104 0 012.585-.364v-.384c0-1.434-1.022-2.7-2.476-2.917A49.138 49.138 0 0012 12.75zM21.75 18.131a2.604 2.604 0 00-1.915.165 4.104 4.104 0 01-3.67 0 2.604 2.604 0 00-2.33 0 4.104 4.104 0 01-3.67 0 2.604 2.604 0 00-2.33 0 4.104 4.104 0 01-3.67 0 2.604 2.604 0 00-1.915-.165v2.494c0 1.036.84 1.875 1.875 1.875h15.75c1.035 0 1.875-.84 1.875-1.875v-2.494z" />
              </svg>
            </span>
            <div>
              <span className="profile-info-label">Birthday</span>
              <span className="profile-info-value">{formatDate(profile.date_of_birth)}</span>
            </div>
          </div>
        )}

        {profile?.linkedin_url && (
          <div className="profile-info-item">
            <span className="profile-info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
              </svg>
            </span>
            <div>
              <span className="profile-info-label">LinkedIn</span>
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="profile-info-link">
                View Profile
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="profile-stats">
        <div className="profile-stat">
          <span className="profile-stat-value">{profile?.attendance_rate ?? 100}%</span>
          <span className="profile-stat-label">Attendance Rate</span>
        </div>
      </div>

      {/* Actions */}
      <div className="profile-actions">
        <button onClick={onLogout} className="profile-logout-btn">
          Log Out
        </button>
      </div>
    </div>
  );
}

export default function Profile() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { user, profile, signIn, signOut, loading, refreshProfile, error: authError } = useAuth();
  const navigate = useNavigate();

  // Check for pending avatar on profile page load (safety net)
  useEffect(() => {
    const checkPendingAvatar = async () => {
      if (!user || !profile) return;
      // Only attempt if the profile has no avatar set
      if (profile.avatar_url) return;

      try {
        const pending = await getPendingAvatar();
        if (pending && pending.userId === user.id) {
          console.log('[Profile] Found pending avatar in IndexedDB, uploading...');
          await uploadAvatar(user.id, pending.file);
          await clearPendingAvatar();
          console.log('[Profile] Pending avatar uploaded from Profile page');
          await refreshProfile();
        }
      } catch (err) {
        console.error('[Profile] Failed to upload pending avatar:', err);
      }
    };

    checkPendingAvatar();
  }, [user, profile]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: signInError } = await signIn({ email, password });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      navigate("/");
    } catch (err) {
      setError(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleSaveProfile = async (formData) => {
    await updateProfile(user.id, formData);
    await refreshProfile();
    setIsEditing(false);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="profile-page">
        <section className="profile-content">
          <div className="profile-container">
            <div className="profile-loading">
              <div className="profile-loading-spinner"></div>
              <p>Loading...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // User is logged in but profile might still be loading or missing
  if (user && !profile) {
    return (
      <div className="profile-page">
        <section className="profile-content">
          <div className="profile-container">
            <div className="profile-modern-card" style={{ textAlign: 'center' }}>
              <div className="profile-avatar-placeholder" style={{ margin: '0 auto 20px' }}>
                <span>?</span>
              </div>
              <h1 className="profile-name">Welcome!</h1>
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                Logged in as: {user.email}
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
                Your profile is being set up. Click below to retry or set up your profile.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={async () => {
                    try {
                      await refreshProfile();
                    } catch (err) {
                      console.error('Retry failed:', err);
                    }
                  }}
                  className="profile-btn-primary"
                  style={{ padding: '0.625rem 1.5rem' }}
                >
                  Retry Loading Profile
                </button>
                <button onClick={handleLogout} className="profile-logout-btn">
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <section className="profile-content">
        <div className="profile-container">
          {user && profile ? (
            isEditing ? (
              <div className="profile-modern-card">
                <h2 className="profile-edit-title">Edit Profile</h2>
                <EditProfileForm
                  profile={profile}
                  onSave={handleSaveProfile}
                  onCancel={() => setIsEditing(false)}
                />
              </div>
            ) : (
              <UserProfileView
                profile={profile}
                onEdit={() => setIsEditing(true)}
                onLogout={handleLogout}
              />
            )
          ) : (
            <div className="profile-login-card">
              <h1 className="profile-login-title">Welcome Back</h1>
              <p className="profile-login-subtitle">Sign in to access your VENSA account</p>

              <form onSubmit={handleLogin} className="profile-login-form">
                {(error || authError) && (
                  <div className="profile-error-banner">
                    {error || authError}
                  </div>
                )}

                <div className="profile-field">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="password">Password</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      style={{ paddingRight: '40px', width: '100%' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'white'
                      }}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                          <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
                          <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
                          <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                          <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="profile-form-options">
                  <label className="profile-remember">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="profile-forgot">Forgot Password?</Link>
                </div>

                <button
                  type="submit"
                  className="profile-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>

                <div className="profile-divider">
                  <span>or</span>
                </div>

                <p className="profile-signup-prompt">
                  New to VENSA? <Link to="/signup" className="profile-signup-link">Create an account</Link>
                </p>
              </form>
            </div>
          )}
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
                  <span>University of Florida</span>
                </a>
                <a
                  href="https://www.linkedin.com/company/ufvensa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-item"
                >
                  <img src={linkedinIcon} alt="LinkedIn" className="contact-icon" />
                  <span>VENSA at UF</span>
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

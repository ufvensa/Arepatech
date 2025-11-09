import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  padding: "8px 12px",
  textDecoration: "none",
  color: isActive ? "black" : "inherit",
  background: isActive ? "#f0f0f0" : "transparent",
  borderRadius: 6,
});

export default function Navbar() {
  return (
    <header style={{ background: "#0b43e5", color: "white" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "12px 16px",
        }}
      >
        {/* Brand */}
        <NavLink to="/" style={{ ...linkStyle({ isActive: false }), fontWeight: 700 }}>
          UF VENSA
        </NavLink>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Tabs */}
        <nav style={{ display: "flex", gap: 12 }}>
          <NavLink to="/about" style={linkStyle}>About</NavLink>
          <NavLink to="/events" style={linkStyle}>Events</NavLink>
          <NavLink to="/get-involved" style={linkStyle}>Get Involved</NavLink>
          <NavLink to="/resources" style={linkStyle}>Resources</NavLink>
          <NavLink to="/profile" style={linkStyle}>Profile</NavLink>
        </nav>
      </div>
    </header>
  );
}
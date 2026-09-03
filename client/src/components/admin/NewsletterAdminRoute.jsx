import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { canAccessNewsletters } from "../../lib/newsletters";

export default function NewsletterAdminRoute({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <main className="newsletter-access-state">Checking newsletter access…</main>;
  if (!user) return <Navigate to="/profile" replace />;
  if (!canAccessNewsletters(profile)) {
    return (
      <main className="newsletter-access-state">
        <div>
          <span className="newsletter-kicker">Restricted area</span>
          <h1>Newsletter access required</h1>
          <p>This workspace is available only to authorized VENSA E-Board members.</p>
        </div>
      </main>
    );
  }
  return children;
}

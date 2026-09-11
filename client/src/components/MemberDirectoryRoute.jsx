import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MemberDirectoryRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="newsletter-access-state" role="status">
        Checking member access…
      </main>
    );
  }

  if (!user) return <Navigate to="/profile" replace />;

  return children;
}

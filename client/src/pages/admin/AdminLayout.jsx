import { Link, NavLink, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canAccessFinance } from '../../lib/finance';
import { canAccessNewsletters } from '../../lib/newsletters';
import '../../admin.css';

export default function AdminLayout() {
  const { user, profile, loading } = useAuth();
  if (loading) return <main className="newsletter-access-state">Checking admin access…</main>;
  if (!user) return <Navigate to="/profile" replace />;
  if (!canAccessFinance(profile) && !canAccessNewsletters(profile)) {
    return <main className="newsletter-access-state"><div><h1>Admin access required</h1><p>This area is available to authorized VENSA staff.</p><Link to="/profile">Back to profile</Link></div></main>;
  }
  return <div className="admin-area">
    <nav className="admin-navigation" aria-label="Admin workspaces">
      <NavLink to="/admin" end>Admin overview</NavLink>
      {canAccessNewsletters(profile) && <NavLink to="/admin/newsletters">Newsletters</NavLink>}
      {canAccessFinance(profile) && <NavLink to="/admin/finance">Treasury</NavLink>}
    </nav>
    <Outlet />
  </div>;
}

export function AdminDashboard() {
  const { profile } = useAuth();
  return <main className="admin-dashboard">
    <span className="newsletter-kicker">VENSA administration</span>
    <h1>Admin</h1><p>Choose a workspace to get started.</p>
    <div className="admin-workspaces">
      {canAccessNewsletters(profile) && <Link to="/admin/newsletters"><h2>Newsletters</h2><p>Create, review, schedule, and monitor member emails.</p><span>Open newsletters →</span></Link>}
      {canAccessFinance(profile) && <Link to="/admin/finance"><h2>Treasury</h2><p>Manage sourced financial records, funding, and event planning.</p><span>Open treasury →</span></Link>}
    </div>
  </main>;
}

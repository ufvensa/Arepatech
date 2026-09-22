import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  canAccessFinance,
  financeCall,
  financeDataset,
  saveFinanceRecord,
  financeAudit,
} from "../../lib/finance";
import FinanceWorkspace from "./FinanceWorkspace";
const financeService = {
  financeCall,
  financeDataset,
  saveFinanceRecord,
  financeAudit,
};
export default function FinanceDashboard() {
  const { user, profile, loading } = useAuth();
  if (loading)
    return (
      <main className="finance">
        <p>Checking treasury access…</p>
      </main>
    );
  if (!user) return <Navigate to="/profile" replace />;
  if (!canAccessFinance(profile))
    return (
      <main className="finance">
        <h1>Treasury access required</h1>
        <p>
          This workspace is available to authorized VENSA E-Board, president,
          and technology staff.
        </p>
        <Link to="/profile">Back to profile</Link>
      </main>
    );
  return <FinanceWorkspace key={user.id} service={financeService} />;
}

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  canApproveNewsletter,
  createNewsletter,
  deleteNewsletter,
  duplicateNewsletter,
  getRecipientCount,
  listNewsletters,
  NEWSLETTER_STATUSES,
  reviewNewsletter,
  sendNewsletter,
  submitNewsletter,
} from "../../lib/newsletters";

const GROUPS = {
  drafts: ["draft", "ready_for_review", "approved", "failed"],
  scheduled: ["scheduled", "sending"],
  sent: ["sent"],
};

function formatDate(value) {
  return value ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—";
}

export default function NewsletterDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [newsletters, setNewsletters] = useState([]);
  const [tab, setTab] = useState("drafts");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const isApprover = canApproveNewsletter(profile);

  const load = async () => {
    setLoading(true);
    try { setNewsletters(await listNewsletters()); setError(""); }
    catch (loadError) { setError(loadError.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  const shown = useMemo(() => newsletters.filter((item) => GROUPS[tab].includes(item.status)), [newsletters, tab]);

  const perform = async (key, action) => {
    setBusy(key); setError("");
    try { await action(); await load(); }
    catch (actionError) { setError(actionError.message); }
    finally { setBusy(""); }
  };

  const create = () => perform("create", async () => {
    const newsletter = await createNewsletter(user.id);
    navigate(`/admin/newsletters/${newsletter.id}`);
  });

  const sendNow = async (newsletter) => {
    const count = await getRecipientCount();
    if (!window.confirm(`You are about to email ${count} VENSA members.\n\nSubject:\n${newsletter.subject}\n\nThis action cannot be undone.`)) return;
    await perform(`send-${newsletter.id}`, () => sendNewsletter(newsletter.id));
  };

  return (
    <main className="newsletter-admin-page">
      <header className="newsletter-admin-header">
        <div>
          <span className="newsletter-kicker">Admin dashboard</span>
          <h1>Newsletters</h1>
          <p>Create, review, schedule, and monitor VENSA member emails.</p>
        </div>
        <button className="newsletter-primary-button" onClick={create} disabled={busy === "create"}>+ Create newsletter</button>
      </header>

      {error && <div className="newsletter-alert error" role="alert">{error}</div>}
      <nav className="newsletter-tabs" aria-label="Newsletter status">
        {Object.keys(GROUPS).map((group) => (
          <button key={group} className={tab === group ? "active" : ""} onClick={() => setTab(group)}>
            {group[0].toUpperCase() + group.slice(1)}
            <span>{newsletters.filter((item) => GROUPS[group].includes(item.status)).length}</span>
          </button>
        ))}
      </nav>

      <section className="newsletter-list-card">
        {loading ? <div className="newsletter-empty">Loading newsletters…</div> : shown.length === 0 ? (
          <div className="newsletter-empty"><h2>No {tab} newsletters</h2><p>Create a newsletter or check another status.</p></div>
        ) : (
          <div className="newsletter-table-wrap">
            <table className="newsletter-table">
              <thead><tr><th>Newsletter</th><th>Status</th><th>Created by</th><th>Scheduled</th><th>Sent</th><th>Actions</th></tr></thead>
              <tbody>{shown.map((newsletter) => (
                <tr key={newsletter.id}>
                  <td><strong>{newsletter.title || "Untitled newsletter"}</strong><small>{newsletter.subject}</small></td>
                  <td><span className={`newsletter-status ${newsletter.status}`}>{NEWSLETTER_STATUSES[newsletter.status]}</span></td>
                  <td>{[newsletter.creator?.first_name, newsletter.creator?.last_name].filter(Boolean).join(" ") || "VENSA"}</td>
                  <td>{formatDate(newsletter.scheduled_for)}</td>
                  <td>{formatDate(newsletter.sent_at)}</td>
                  <td><div className="newsletter-row-actions">
                    {newsletter.status === "draft" && <Link to={`/admin/newsletters/${newsletter.id}`}>Edit</Link>}
                    {newsletter.status === "approved" && <Link to={`/admin/newsletters/${newsletter.id}`}>Schedule</Link>}
                    {newsletter.status === "ready_for_review" && isApprover && <Link to={`/admin/newsletters/${newsletter.id}`}>Review</Link>}
                    <Link to={`/admin/newsletters/${newsletter.id}/preview`}>{newsletter.status === "sent" ? "View" : "Preview"}</Link>
                    <button disabled={busy === `copy-${newsletter.id}`} onClick={() => perform(`copy-${newsletter.id}`, async () => navigate(`/admin/newsletters/${await duplicateNewsletter(newsletter.id)}`))}>Duplicate</button>
                    {newsletter.status === "draft" && <button onClick={() => window.confirm("Submit this newsletter for approval?") && perform(`submit-${newsletter.id}`, () => submitNewsletter(newsletter.id))}>Submit</button>}
                    {newsletter.status === "draft" && <button className="danger" onClick={() => window.confirm("Delete this draft? This cannot be undone.") && perform(`delete-${newsletter.id}`, () => deleteNewsletter(newsletter.id))}>Delete</button>}
                    {isApprover && newsletter.status === "ready_for_review" && <button onClick={() => window.confirm("Approve this newsletter?") && perform(`approve-${newsletter.id}`, () => reviewNewsletter(newsletter.id, true))}>Approve</button>}
                    {isApprover && newsletter.status === "ready_for_review" && <button onClick={() => window.confirm("Send this newsletter back to draft?") && perform(`reject-${newsletter.id}`, () => reviewNewsletter(newsletter.id, false))}>Return to draft</button>}
                    {isApprover && ["approved", "failed"].includes(newsletter.status) && <button className="send" onClick={() => sendNow(newsletter)}>Send now</button>}
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      {tab === "sent" && shown.map((newsletter) => (
        <section key={newsletter.id} className="newsletter-analytics-card">
          <div><strong>{newsletter.title}</strong><span>Delivery totals</span></div>
          {[["Recipients", "recipients"], ["Sent", "accepted"], ["Failed", "failed"], ["Delivered", "delivered"], ["Bounced", "bounced"]].map(([label, key]) => (
            <div key={key}><strong>{newsletter.analytics[key] || 0}</strong><span>{label}</span></div>
          ))}
        </section>
      ))}
    </main>
  );
}

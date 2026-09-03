import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getEvents, getResources } from "../../lib/supabase";
import {
  canApproveNewsletter,
  getNewsletter,
  getRecipientCount,
  NEWSLETTER_SECTION_TYPES,
  NEWSLETTER_STATUSES,
  reviewNewsletter,
  saveNewsletter,
  scheduleNewsletter,
  sendNewsletter,
  submitNewsletter,
} from "../../lib/newsletters";
import { renderNewsletterHtml } from "../../../../shared/newsletter-template.js";

function newSection(type) {
  return {
    id: `local-${crypto.randomUUID()}`,
    section_type: type,
    title: "",
    content: "",
    image_url: "",
    button_text: "",
    button_url: "",
    is_visible: true,
    metadata: {},
  };
}

function localDateTimeMinimum() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function EditorModal({ title, children, onClose }) {
  return (
    <div className="newsletter-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="newsletter-modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <div className="newsletter-modal-title"><h2>{title}</h2><button type="button" onClick={onClose} aria-label="Close">×</button></div>
        {children}
      </div>
    </div>
  );
}

export default function NewsletterEditor() {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [newsletter, setNewsletter] = useState(null);
  const [sections, setSections] = useState([]);
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [sectionType, setSectionType] = useState("featured_event");
  const [previewWidth, setPreviewWidth] = useState("desktop");
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitInFlight = useRef(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [testOpen, setTestOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleValue, setScheduleValue] = useState("");
  const editable = newsletter?.status === "draft";
  const isApprover = canApproveNewsletter(profile);

  useEffect(() => {
    Promise.all([
      getNewsletter(id),
      getEvents({ upcoming: true }).catch(() => []),
      getResources().catch(() => []),
    ])
      .then(([result, sourceEvents, sourceResources]) => {
        setNewsletter(result.newsletter);
        setSections(result.sections);
        setEvents(sourceEvents || []);
        setResources(sourceResources || []);
      })
      .catch((loadError) => setError(loadError.message));
  }, [id]);

  const html = useMemo(() => newsletter ? renderNewsletterHtml({
    newsletter,
    sections,
    siteUrl: window.location.origin,
    recipientToken: "preview",
  }) : "", [newsletter, sections]);

  const updateSection = (index, patch) => setSections((current) => current.map((section, position) => position === index ? { ...section, ...patch } : section));
  const moveSection = (index, direction) => setSections((current) => {
    const destination = index + direction;
    if (destination < 0 || destination >= current.length) return current;
    const copy = [...current];
    [copy[index], copy[destination]] = [copy[destination], copy[index]];
    return copy;
  });
  const duplicateSection = (index) => setSections((current) => {
    const clone = { ...current[index], id: `local-${crypto.randomUUID()}`, metadata: { ...(current[index].metadata || {}) } };
    return [...current.slice(0, index + 1), clone, ...current.slice(index + 1)];
  });

  const selectEvent = (index, eventId) => {
    const event = events.find((item) => item.id === eventId);
    if (!event) return;
    updateSection(index, {
      title: event.title,
      content: event.description || "",
      image_url: event.image_url || "",
      button_text: event.rsvp_link ? "RSVP" : "Learn more",
      button_url: event.rsvp_link || "",
      metadata: {
        ...(sections[index].metadata || {}),
        source_event_id: event.id,
        date: event.date ? new Date(event.date).toLocaleDateString([], { dateStyle: "long" }) : "",
        time: event.date ? new Date(event.date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "",
        location: event.location || "",
      },
    });
  };

  const selectResource = (index, resourceId) => {
    const resource = resources.find((item) => item.id === resourceId);
    if (!resource) return;
    updateSection(index, {
      title: resource.title,
      content: resource.description || "",
      image_url: resource.image_url || "",
      button_text: "View opportunity",
      button_url: resource.file_url || `${window.location.origin}/resources/${resource.id}`,
      metadata: { ...(sections[index].metadata || {}), source_resource_id: resource.id },
    });
  };

  const run = async (action, success) => {
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await action();
      if (success) setMessage(success);
      return result;
    }
    catch (actionError) { setError(actionError.message); throw actionError; }
    finally { setBusy(false); }
  };

  const save = () => run(async () => {
    await saveNewsletter(newsletter, sections);
    const refreshed = await getNewsletter(id);
    setNewsletter(refreshed.newsletter); setSections(refreshed.sections);
  }, "Draft saved.");

  const submit = async () => {
    if (submitInFlight.current || busy || newsletter?.status !== "draft") return;
    console.log("[newsletter] submit_for_approval", {
      newsletterId: id,
      currentStatus: newsletter.status,
    });
    if (!window.confirm("Save and submit this newsletter for approval?")) return;
    submitInFlight.current = true;
    setSubmitting(true);
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await saveNewsletter(newsletter, sections);
      const submittedNewsletter = await submitNewsletter(id);
      setNewsletter((current) => ({
        ...current,
        ...(submittedNewsletter || {}),
        status: "ready_for_review",
      }));
      const refreshed = await getNewsletter(id);
      setNewsletter(refreshed.newsletter);
      setSections(refreshed.sections);
      setMessage("Newsletter submitted for approval.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit the newsletter for approval.");
    } finally {
      submitInFlight.current = false;
      setSubmitting(false);
      setBusy(false);
    }
  };

  const approve = async (approved) => {
    if (!window.confirm(approved ? "Approve this newsletter?" : "Return this newsletter to draft for revisions?")) return;
    try { await run(() => reviewNewsletter(id, approved)); navigate("/admin/newsletters"); }
    catch { /* Error is displayed in the editor. */ }
  };

  const sendTest = async (event) => {
    event.preventDefault();
    try {
      const result = await run(async () => {
        if (editable) await saveNewsletter(newsletter, sections);
        return sendNewsletter(id, testEmail);
      }, `Test sent to ${testEmail}.`);
      setTestOpen(false);
      if (result?.test) navigate("/admin/newsletters?tab=sent");
    } catch { /* Error is displayed in the editor. */ }
  };

  const sendNow = async () => {
    try {
      const count = await getRecipientCount();
      if (!window.confirm(`You are about to email ${count} VENSA members.\n\nSubject:\n${newsletter.subject}\n\nThis action cannot be undone.`)) return;
      const result = await run(() => sendNewsletter(id));
      if (result?.status === "sent") navigate("/admin/newsletters?tab=sent");
    } catch (sendError) { setError(sendError.message); }
  };

  const schedule = async (event) => {
    event.preventDefault();
    if (!window.confirm(`Schedule “${newsletter.subject}” for ${new Date(scheduleValue).toLocaleString()}?`)) return;
    try { await run(() => scheduleNewsletter(id, new Date(scheduleValue).toISOString())); setScheduleOpen(false); navigate("/admin/newsletters"); }
    catch { /* Error is displayed in the editor. */ }
  };

  if (!newsletter) return <main className="newsletter-access-state">{error || "Loading newsletter…"}</main>;

  return (
    <main className="newsletter-editor-page">
      <header className="newsletter-editor-header">
        <div><Link to="/admin/newsletters">← Newsletters</Link><h1>{newsletter.title || "Untitled newsletter"}</h1><span className={`newsletter-status ${newsletter.status}`}>{NEWSLETTER_STATUSES[newsletter.status]}</span></div>
        <div className="newsletter-editor-actions">
          <Link className="newsletter-secondary-button" to={`/admin/newsletters/${id}/preview`}>Full preview</Link>
          <button type="button" className="newsletter-secondary-button" onClick={() => setTestOpen(true)} disabled={busy}>Send test</button>
          {editable && <button type="button" className="newsletter-secondary-button" onClick={save} disabled={busy}>Save draft</button>}
          {editable && <button type="button" className="newsletter-primary-button" onClick={submit} disabled={busy || submitting}>{submitting ? "Submitting..." : "Submit for approval"}</button>}
          {isApprover && newsletter.status === "ready_for_review" && <button type="button" className="newsletter-secondary-button" onClick={() => approve(false)} disabled={busy}>Return to draft</button>}
          {isApprover && newsletter.status === "ready_for_review" && <button type="button" className="newsletter-primary-button" onClick={() => approve(true)} disabled={busy}>Approve</button>}
          {isApprover && newsletter.status === "approved" && <button type="button" className="newsletter-secondary-button" onClick={() => setScheduleOpen(true)} disabled={busy}>Schedule</button>}
          {isApprover && ["approved", "failed"].includes(newsletter.status) && <button type="button" className="newsletter-send-button" onClick={sendNow} disabled={busy}>Send now</button>}
        </div>
      </header>
      {message && <div className="newsletter-alert success">{message}</div>}
      {error && <div className="newsletter-alert error" role="alert">{error}</div>}

      <div className="newsletter-editor-layout">
        <section className="newsletter-editor-panel">
          {!editable && <div className="newsletter-alert info">Content is locked. Return the newsletter to draft before editing.</div>}
          <fieldset disabled={!editable || busy}>
            <div className="newsletter-form-card">
              <label>Subject<input value={newsletter.subject} onChange={(event) => setNewsletter({ ...newsletter, subject: event.target.value })} maxLength="180" /></label>
              <label>Preview text<input value={newsletter.preview_text} onChange={(event) => setNewsletter({ ...newsletter, preview_text: event.target.value })} maxLength="220" /></label>
              <label>Newsletter heading<input value={newsletter.title} onChange={(event) => setNewsletter({ ...newsletter, title: event.target.value })} /></label>
              <label>Intro message<textarea rows="4" value={newsletter.intro} onChange={(event) => setNewsletter({ ...newsletter, intro: event.target.value })} /></label>
            </div>

            <div className="newsletter-section-heading"><div><h2>Newsletter sections</h2><p>Add, reorder, duplicate, or hide modular content.</p></div><div><select value={sectionType} onChange={(event) => setSectionType(event.target.value)}>{NEWSLETTER_SECTION_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="button" onClick={() => setSections([...sections, newSection(sectionType)])}>Add section</button></div></div>

            {sections.map((section, index) => (
              <article className={`newsletter-section-editor${section.is_visible === false ? " hidden" : ""}`} key={section.id}>
                <div className="newsletter-section-toolbar">
                  <strong>{NEWSLETTER_SECTION_TYPES.find(([value]) => value === section.section_type)?.[1]}</strong>
                  <div>
                    <label className="newsletter-toggle"><input type="checkbox" checked={section.is_visible !== false} onChange={(event) => updateSection(index, { is_visible: event.target.checked })} />Visible</label>
                    <button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0}>↑</button>
                    <button type="button" onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1}>↓</button>
                    <button type="button" onClick={() => duplicateSection(index)}>Duplicate</button>
                    <button type="button" className="danger" onClick={() => setSections(sections.filter((_, position) => position !== index))}>Remove</button>
                  </div>
                </div>
                {["featured_event", "upcoming_events"].includes(section.section_type) && events.length > 0 && <label>Select existing event<select value={section.metadata?.source_event_id || ""} onChange={(event) => selectEvent(index, event.target.value)}><option value="">Choose an event…</option>{events.map((sourceEvent) => <option value={sourceEvent.id} key={sourceEvent.id}>{sourceEvent.title} — {new Date(sourceEvent.date).toLocaleDateString()}</option>)}</select></label>}
                {section.section_type === "professional_opportunities" && resources.length > 0 && <label>Select existing resource<select value={section.metadata?.source_resource_id || ""} onChange={(event) => selectResource(index, event.target.value)}><option value="">Choose a resource…</option>{resources.map((resource) => <option value={resource.id} key={resource.id}>{resource.title}</option>)}</select></label>}
                <label>Section title<input value={section.title || ""} onChange={(event) => updateSection(index, { title: event.target.value })} /></label>
                <label>Content<textarea rows="5" value={section.content || ""} onChange={(event) => updateSection(index, { content: event.target.value })} /></label>
                <div className="newsletter-form-grid"><label>Image URL<input type="url" value={section.image_url || ""} onChange={(event) => updateSection(index, { image_url: event.target.value })} /></label><label>Button text<input value={section.button_text || ""} onChange={(event) => updateSection(index, { button_text: event.target.value })} /></label><label>Button URL<input type="url" value={section.button_url || ""} onChange={(event) => updateSection(index, { button_url: event.target.value })} /></label></div>
              </article>
            ))}
          </fieldset>
        </section>

        <aside className="newsletter-live-preview">
          <div className="newsletter-preview-toolbar"><strong>Live preview</strong><div><button type="button" className={previewWidth === "desktop" ? "active" : ""} onClick={() => setPreviewWidth("desktop")}>Desktop</button><button type="button" className={previewWidth === "mobile" ? "active" : ""} onClick={() => setPreviewWidth("mobile")}>Mobile</button></div></div>
          <iframe title="Live newsletter preview" srcDoc={html} className={previewWidth} />
        </aside>
      </div>

      {testOpen && <EditorModal title="Send test email" onClose={() => setTestOpen(false)}><form onSubmit={sendTest}><label>Send test to<input type="email" required autoFocus value={testEmail} onChange={(event) => setTestEmail(event.target.value)} placeholder="name@example.com" /></label><p>Test messages use the exact rendered newsletter and do not change its status.</p><div className="newsletter-modal-actions"><button type="button" onClick={() => setTestOpen(false)}>Cancel</button><button type="submit" className="newsletter-primary-button" disabled={busy}>Send test</button></div></form></EditorModal>}
      {scheduleOpen && <EditorModal title="Schedule newsletter" onClose={() => setScheduleOpen(false)}><form onSubmit={schedule}><label>Date and time<input type="datetime-local" required autoFocus min={localDateTimeMinimum()} value={scheduleValue} onChange={(event) => setScheduleValue(event.target.value)} /></label><p>The time is interpreted in your current local timezone.</p><div className="newsletter-modal-actions"><button type="button" onClick={() => setScheduleOpen(false)}>Cancel</button><button type="submit" className="newsletter-primary-button" disabled={busy}>Review and schedule</button></div></form></EditorModal>}
    </main>
  );
}

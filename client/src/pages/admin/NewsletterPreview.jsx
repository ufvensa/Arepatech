import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getNewsletter } from "../../lib/newsletters";
import { renderNewsletterHtml } from "../../../../shared/newsletter-template.js";

export default function NewsletterPreview() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [width, setWidth] = useState("desktop");
  const [error, setError] = useState("");
  useEffect(() => { getNewsletter(id).then(setData).catch((loadError) => setError(loadError.message)); }, [id]);
  const html = useMemo(() => data ? renderNewsletterHtml({ ...data, siteUrl: window.location.origin, recipientToken: "preview" }) : "", [data]);
  if (!data) return <main className="newsletter-access-state">{error || "Loading preview…"}</main>;
  return (
    <main className="newsletter-full-preview-page">
      <header><div><Link to={`/admin/newsletters/${id}`}>← Back to editor</Link><h1>{data.newsletter.title}</h1></div><div><button className={width === "desktop" ? "active" : ""} onClick={() => setWidth("desktop")}>Desktop</button><button className={width === "mobile" ? "active" : ""} onClick={() => setWidth("mobile")}>Mobile</button></div></header>
      <iframe title="Newsletter preview" srcDoc={html} className={width} />
    </main>
  );
}

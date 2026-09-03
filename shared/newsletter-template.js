export const NEWSLETTER_SECTION_LABELS = {
  featured_event: "Featured Event",
  upcoming_events: "Upcoming Events",
  announcement: "Announcement",
  professional_opportunities: "Professional Opportunities",
  community_service: "Community Service",
  athletics: "Athletics",
  member_spotlight: "Member Spotlight",
  custom_text: "Update",
  image: "",
  cta: "",
};

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeUrl(value, fallback = "#") {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? escapeHtml(url.href) : fallback;
  } catch {
    return fallback;
  }
}

function paragraphs(value = "") {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

function renderSection(section) {
  const label = NEWSLETTER_SECTION_LABELS[section.section_type] || "VENSA Update";
  const metadata = section.metadata || {};
  const image = section.image_url
    ? `<tr><td style="padding:0 0 18px"><img src="${safeUrl(section.image_url)}" alt="${escapeHtml(section.title || label)}" width="568" style="display:block;width:100%;max-width:568px;height:auto;border-radius:12px;border:0"></td></tr>`
    : "";
  const details = [metadata.date, metadata.time, metadata.location]
    .filter(Boolean)
    .map(escapeHtml)
    .join(" &nbsp;•&nbsp; ");
  const button = section.button_text && section.button_url
    ? `<tr><td style="padding-top:18px"><a href="${safeUrl(section.button_url)}" style="display:inline-block;background:#f6c534;color:#172554;text-decoration:none;font-weight:800;padding:12px 20px;border-radius:7px">${escapeHtml(section.button_text)}</a></td></tr>`
    : "";

  if (section.section_type === "image") {
    return image ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px">${image}</table>` : "";
  }

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:#ffffff;border:1px solid #e4e9f2;border-radius:12px">
      <tr><td style="padding:24px">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${image}
          ${label ? `<tr><td style="padding:0 0 7px;color:#2f4d9a;font-size:12px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase">${escapeHtml(label)}</td></tr>` : ""}
          ${section.title ? `<tr><td style="padding:0 0 10px;color:#172554;font-size:23px;line-height:1.25;font-weight:800">${escapeHtml(section.title)}</td></tr>` : ""}
          ${details ? `<tr><td style="padding:0 0 12px;color:#36558f;font-size:13px;font-weight:700">${details}</td></tr>` : ""}
          ${section.content ? `<tr><td style="color:#475569;font-size:16px;line-height:1.65">${paragraphs(section.content)}</td></tr>` : ""}
          ${button}
        </table>
      </td></tr>
    </table>`;
}

/**
 * @param {{newsletter: Record<string, unknown>, sections?: Array<Record<string, any>>, siteUrl?: string, recipientToken?: string}} options
 */
export function renderNewsletterHtml({ newsletter, sections = [], siteUrl = "https://ufvensa.org", recipientToken = "preview" }) {
  const normalizedSiteUrl = siteUrl.replace(/\/$/, "");
  const hasPreferencesToken = /^[a-f0-9]{64}$/i.test(recipientToken);
  const preferencesUrl = `${normalizedSiteUrl}/unsubscribe?token=${encodeURIComponent(recipientToken)}`;
  const visibleSections = [...sections]
    .filter((section) => section.is_visible !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(newsletter.subject || "VENSA Newsletter")}</title></head>
<body style="margin:0;padding:0;background:#eef2f8;font-family:Arial,Helvetica,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(newsletter.preview_text || "The latest news from UF VENSA")}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f8">
    <tr><td align="center" style="padding:24px 12px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#f8fafc;border-radius:16px;overflow:hidden">
        <tr><td align="center" style="padding:28px 24px;background:#1e3a8a">
          <a href="${safeUrl(normalizedSiteUrl)}" style="text-decoration:none">
            <img src="${safeUrl(`${normalizedSiteUrl}/vensa-logo.png`)}" width="76" alt="VENSA" style="display:block;margin:0 auto 12px;width:76px;height:auto;border:0">
            <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:.3px">UF Venezuelan Student Association</span>
          </a>
        </td></tr>
        <tr><td align="center" style="padding:28px 28px 12px">
          <div style="color:#d39519;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase">VENSA Update</div>
          <h1 style="margin:10px 0 12px;color:#172554;font-size:34px;line-height:1.15">${escapeHtml(newsletter.title || newsletter.subject || "This Week at VENSA")}</h1>
          ${newsletter.intro ? `<p style="max-width:540px;margin:0;color:#475569;font-size:17px;line-height:1.65">${paragraphs(newsletter.intro)}</p>` : ""}
        </td></tr>
        <tr><td style="padding:18px 36px 12px">${visibleSections.map(renderSection).join("")}</td></tr>
        <tr><td align="center" style="padding:28px 24px;background:#1e3a8a;color:#ffffff">
          <div style="font-size:18px;font-weight:800">Venezuelan Student Association at UF</div>
          <div style="padding-top:10px;font-size:13px;line-height:1.6;color:#dbe5ff">University of Florida • Gainesville, FL<br>
            <a href="https://www.instagram.com/ufvensa/" style="color:#ffffff">Instagram</a> &nbsp;•&nbsp;
            <a href="https://www.facebook.com/uf.vensa/" style="color:#ffffff">Facebook</a> &nbsp;•&nbsp;
            <a href="https://www.linkedin.com/company/ufvensa" style="color:#ffffff">LinkedIn</a>
          </div>
          <div style="margin-top:20px;padding-top:18px;border-top:1px solid #5670b2;font-size:12px;color:#c8d3ee">
            ${hasPreferencesToken ? `<a href="${safeUrl(preferencesUrl)}" style="color:#ffffff">Manage Email Preferences</a>
            &nbsp;•&nbsp;
            <a href="${safeUrl(preferencesUrl)}" style="color:#ffffff">Unsubscribe</a><br>` : ""}
            <span style="display:inline-block;padding-top:10px">© ${new Date().getUTCFullYear()} VENSA. All Rights Reserved.</span>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/**
 * @param {{newsletter: Record<string, unknown>, sections?: Array<Record<string, any>>, siteUrl?: string, recipientToken?: string}} options
 */
export function renderNewsletterText({ newsletter, sections = [], siteUrl = "https://ufvensa.org", recipientToken = "preview" }) {
  const body = sections
    .filter((section) => section.is_visible !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .map((section) => `${section.title || NEWSLETTER_SECTION_LABELS[section.section_type] || "Update"}\n${section.content || ""}\n${section.button_url || ""}`)
    .join("\n\n");
  const preferences = /^[a-f0-9]{64}$/i.test(recipientToken)
    ? `\n\nManage preferences or unsubscribe: ${siteUrl.replace(/\/$/, "")}/unsubscribe?token=${encodeURIComponent(recipientToken)}`
    : "";
  return `${newsletter.title || newsletter.subject || "VENSA Update"}\n\n${newsletter.intro || ""}\n\n${body}${preferences}`;
}

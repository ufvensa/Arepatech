import { supabase } from "./supabase";

export const NEWSLETTER_SECTION_TYPES = [
  ["featured_event", "Featured Event"],
  ["upcoming_events", "Upcoming Events"],
  ["announcement", "Announcement"],
  ["professional_opportunities", "Professional Opportunities"],
  ["community_service", "Community Service"],
  ["athletics", "Athletics"],
  ["member_spotlight", "Member Spotlight"],
  ["custom_text", "Custom Text"],
  ["image", "Image"],
  ["cta", "Call to Action"],
];

export const NEWSLETTER_STATUSES = {
  draft: "Draft",
  ready_for_review: "Ready for review",
  approved: "Approved",
  scheduled: "Scheduled",
  sending: "Sending",
  sent: "Sent",
  failed: "Failed",
};

function throwIfError(error) {
  if (error) throw error;
}

export function getNewsletterRole(profile) {
  if (["president", "technology"].includes(profile?.role)) return profile.role;
  if (profile?.role === "eboard" || profile?.status === "eboard" || profile?.is_admin) return "eboard";
  return "member";
}

export function canApproveNewsletter(profile) {
  return ["president", "technology"].includes(getNewsletterRole(profile));
}

export function canAccessNewsletters(profile) {
  return ["eboard", "president", "technology"].includes(getNewsletterRole(profile));
}

export async function listNewsletters() {
  const { data, error } = await supabase.from("newsletters").select(`
    *,
    creator:profiles!newsletters_created_by_fkey(first_name,last_name),
    newsletter_sends(status)
  `).order("updated_at", { ascending: false });
  throwIfError(error);
  return (data || []).map((newsletter) => {
    const analytics = (newsletter.newsletter_sends || []).reduce((totals, send) => {
      totals.recipients += 1;
      totals[send.status] = (totals[send.status] || 0) + 1;
      return totals;
    }, { recipients: 0, accepted: 0, sent: 0, failed: 0, delivered: 0, bounced: 0, complained: 0 });
    analytics.accepted = analytics.sent + analytics.delivered + analytics.bounced + analytics.complained;
    return { ...newsletter, analytics };
  });
}

export async function getNewsletter(id) {
  const [{ data: newsletter, error }, { data: sections, error: sectionsError }] = await Promise.all([
    supabase.from("newsletters").select("*").eq("id", id).single(),
    supabase.from("newsletter_sections").select("*").eq("newsletter_id", id).order("display_order"),
  ]);
  throwIfError(error);
  throwIfError(sectionsError);
  return { newsletter, sections: sections || [] };
}

export async function createNewsletter(userId) {
  const { data, error } = await supabase.from("newsletters").insert({
    subject: "VENSA Newsletter",
    preview_text: "See what is happening at VENSA.",
    title: "This Week at VENSA",
    intro: "Here are the latest events, opportunities, and updates from your VENSA family.",
    created_by: userId,
  }).select().single();
  throwIfError(error);
  return data;
}

export async function saveNewsletter(newsletter, sections) {
  const { data, error } = await supabase.from("newsletters").update({
    subject: newsletter.subject,
    preview_text: newsletter.preview_text,
    title: newsletter.title,
    intro: newsletter.intro,
  }).eq("id", newsletter.id).select().single();
  throwIfError(error);

  const persistedIds = sections.filter((section) => section.id && !String(section.id).startsWith("local-")).map((section) => section.id);
  let deleteQuery = supabase.from("newsletter_sections").delete().eq("newsletter_id", newsletter.id);
  if (persistedIds.length) deleteQuery = deleteQuery.not("id", "in", `(${persistedIds.join(",")})`);
  const { error: deleteError } = await deleteQuery;
  throwIfError(deleteError);

  const rows = sections.map((section, index) => ({
    ...(section.id && !String(section.id).startsWith("local-") ? { id: section.id } : {}),
    newsletter_id: newsletter.id,
    section_type: section.section_type,
    title: section.title || null,
    content: section.content || null,
    image_url: section.image_url || null,
    button_text: section.button_text || null,
    button_url: section.button_url || null,
    display_order: index,
    is_visible: section.is_visible !== false,
    metadata: section.metadata || null,
  }));
  if (rows.length) {
    const { error: sectionError } = await supabase.from("newsletter_sections").upsert(rows);
    throwIfError(sectionError);
  }
  return data;
}

export async function deleteNewsletter(id) {
  const { error } = await supabase.from("newsletters").delete().eq("id", id);
  throwIfError(error);
}

export async function duplicateNewsletter(id) {
  const { data, error } = await supabase.rpc("duplicate_newsletter", { p_newsletter_id: id });
  throwIfError(error);
  return data;
}

export async function submitNewsletter(id) {
  const { data, error } = await supabase.rpc("submit_newsletter", { p_newsletter_id: id });
  throwIfError(error);
  return data;
}

export async function reviewNewsletter(id, approve) {
  const { data, error } = await supabase.rpc("review_newsletter", { p_newsletter_id: id, p_approve: approve });
  throwIfError(error);
  return data;
}

export async function scheduleNewsletter(id, scheduledFor) {
  const { data, error } = await supabase.rpc("schedule_newsletter", {
    p_newsletter_id: id,
    p_scheduled_for: scheduledFor,
  });
  throwIfError(error);
  return data;
}

export async function getRecipientCount() {
  const { data, error } = await supabase.rpc("newsletter_member_count");
  throwIfError(error);
  return Number(data || 0);
}

export async function sendNewsletter(id, testEmail = null) {
  const { data, error } = await supabase.functions.invoke("send-newsletter", {
    body: { newsletter_id: id, ...(testEmail ? { test_email: testEmail } : {}) },
  });
  throwIfError(error);
  if (data?.error) throw new Error(data.error);
  return data;
}

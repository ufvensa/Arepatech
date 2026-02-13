/**
 * Supabase Client Configuration
 * VENSA - Venezuelan Student Association at UF
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

/**
 * Check if an email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
export function isAllowedEmail(email) {
  if (!email) return false;
  return email.includes('@') && email.includes('.');
}

/**
 * Get the allowed email domains for display
 */
export function getAllowedDomains() {
  return ['any email'];
}

// ============================================================================
// AUTH HELPERS
// ============================================================================

/**
 * Sign up a new user with email and password
 * @param {Object} params - Signup parameters
 * @param {string} params.email - User's email
 * @param {string} params.password - User's password
 * @param {Object} params.metadata - Additional user metadata (first_name, last_name, etc.)
 */
export async function signUp({ email, password, metadata }) {
  if (!isAllowedEmail(email)) {
    throw new Error('Please enter a valid email address.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata, // This gets stored in raw_user_meta_data and used by trigger
      emailRedirectTo: window.location.origin, // Redirect back to the same origin after email confirmation
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in with email and password
 */
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// ============================================================================
// PROFILE HELPERS
// ============================================================================

/**
 * Get a user's profile by ID
 * Returns null if profile doesn't exist (instead of throwing)
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data; // Will be null if no profile found
}

/**
 * Get the current user's profile
 */
export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  return getProfile(user.id);
}

/**
 * Update a user's profile
 */
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all profiles (for directory)
 * @param {Object} filters - Optional filters
 * @param {string} filters.status - Filter by member status
 * @param {string} filters.major - Filter by major
 * @param {string} filters.search - Search by name
 */
export async function getProfiles(filters = {}) {
  let query = supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      major,
      year,
      status,
      workplace,
      attendance_rate,
      avatar_url,
      linkedin_url
    `)
    .order('last_name', { ascending: true });

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.major) {
    query = query.eq('major', filters.major);
  }

  if (filters.search) {
    query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,major.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ============================================================================
// EVENTS HELPERS
// ============================================================================

/**
 * Get all published events
 * @param {Object} options - Query options
 * @param {boolean} options.upcoming - Only get upcoming events
 * @param {string} options.type - Filter by event type
 */
export async function getEvents(options = {}) {
  let query = supabase
    .from('events')
    .select(`
      *,
      created_by:profiles!events_created_by_fkey(first_name, last_name)
    `)
    .eq('is_published', true)
    .order('date', { ascending: true });

  if (options.upcoming) {
    query = query.gte('date', new Date().toISOString());
  }

  if (options.type) {
    query = query.eq('type', options.type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Get a single event by ID
 */
export async function getEvent(eventId) {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      created_by:profiles!events_created_by_fkey(first_name, last_name)
    `)
    .eq('id', eventId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new event (E-Board only)
 */
export async function createEvent(eventData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Must be logged in to create events');

  const { data, error } = await supabase
    .from('events')
    .insert({
      ...eventData,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an event (E-Board only)
 */
export async function updateEvent(eventId, updates) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete an event (E-Board only)
 */
export async function deleteEvent(eventId) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) throw error;
}

// ============================================================================
// RESOURCES HELPERS
// ============================================================================

/**
 * Get all published resources
 * @param {Object} filters - Optional filters
 * @param {string} filters.majorTag - Filter by major tag
 * @param {string} filters.search - Search by title or description
 */
export async function getResources(filters = {}) {
  let query = supabase
    .from('resources')
    .select(`
      *,
      author:profiles!resources_author_id_fkey(first_name, last_name, avatar_url)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (filters.majorTag && filters.majorTag !== 'All') {
    query = query.eq('major_tag', filters.majorTag);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Get a single resource by ID
 */
export async function getResource(resourceId) {
  const { data, error } = await supabase
    .from('resources')
    .select(`
      *,
      author:profiles!resources_author_id_fkey(first_name, last_name, avatar_url)
    `)
    .eq('id', resourceId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new resource
 */
export async function createResource(resourceData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Must be logged in to create resources');

  const { data, error } = await supabase
    .from('resources')
    .insert({
      ...resourceData,
      author_id: user.id,
    })
    .select(`
      *,
      author:profiles!resources_author_id_fkey(first_name, last_name, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a resource
 */
export async function updateResource(resourceId, updates) {
  const { data, error } = await supabase
    .from('resources')
    .update(updates)
    .eq('id', resourceId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a resource
 */
export async function deleteResource(resourceId) {
  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', resourceId);

  if (error) throw error;
}

// ============================================================================
// RSVP HELPERS
// ============================================================================

/**
 * RSVP to an event
 */
export async function rsvpToEvent(eventId) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Must be logged in to RSVP');

  const { data, error } = await supabase
    .from('event_rsvps')
    .upsert({
      event_id: eventId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Cancel RSVP to an event
 */
export async function cancelRsvp(eventId) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Must be logged in');

  const { error } = await supabase
    .from('event_rsvps')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Check if user has RSVPed to an event
 */
export async function hasRsvped(eventId) {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('event_rsvps')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

/**
 * Upload an avatar image
 */
export async function uploadAvatar(userId, file) {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Update profile with new avatar URL (cache-busting timestamp)
  const avatarUrl = `${publicUrl}?t=${Date.now()}`;
  await updateProfile(userId, { avatar_url: avatarUrl });

  return avatarUrl;
}

/**
 * Upload a resource image
 */
export async function uploadResourceImage(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('resource-images')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('resource-images')
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Upload a resource file (PDF, DOCX, MD, etc.)
 */
export async function uploadResourceFile(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('resource-files')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('resource-files')
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Upload an event image
 */
export async function uploadEventImage(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('event-images')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('event-images')
    .getPublicUrl(fileName);

  return publicUrl;
}

// ============================================================================
// ADMIN HELPERS
// ============================================================================

/**
 * Check if the current user is an admin
 */
export async function isAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;

  const profile = await getProfile(user.id);
  return profile?.is_admin === true;
}

/**
 * Check if an email is banned
 * @param {string} email - Email to check
 */
export async function isEmailBanned(email) {
  try {
    // Create a timeout promise that rejects after 3 seconds
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Ban check timed out')), 3000)
    );

    // Race the RPC call against the timeout
    const { data, error } = await Promise.race([
      supabase.rpc('is_email_banned', { check_email: email }),
      timeout
    ]);

    if (error) {
      console.error('Error checking banned email:', error);
      return false;
    }

    return data === true;
  } catch (err) {
    console.error('Ban check failed or timed out:', err);
    return false; // Fail open to avoid blocking valid users if DB is slow
  }
}

/**
 * Delete a user account (Admin only)
 * @param {string} userId - ID of user to delete
 * @param {boolean} banEmail - Whether to ban the user's email
 * @param {string} reason - Reason for deletion/ban
 */
export async function adminDeleteUser(userId, banEmail = true, reason = 'Removed by admin') {
  const { data, error } = await supabase.rpc('admin_delete_user', {
    target_user_id: userId,
    ban_email: banEmail,
    ban_reason: reason
  });

  if (error) throw error;
  return data;
}

/**
 * Get all banned emails (Admin only)
 */
export async function getBannedEmails() {
  const { data, error } = await supabase
    .from('banned_emails')
    .select('*')
    .order('banned_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Manually ban an email (Admin only)
 * @param {string} email - Email to ban
 * @param {string} reason - Reason for banning
 */
export async function banEmail(email, reason = 'Banned by admin') {
  const user = await getCurrentUser();
  if (!user) throw new Error('Must be logged in');

  const { data, error } = await supabase
    .from('banned_emails')
    .insert({
      email: email.toLowerCase(),
      banned_by: user.id,
      reason: reason
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export default supabase;

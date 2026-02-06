/**
 * Client-side Google Drive integration (serverless)
 * 
 * Fetches event photos directly from public Google Drive folders
 * using the Google Drive API v3 with an API key.
 * 
 * SETUP:
 * 1. In Google Cloud Console, enable the "Google Drive API" for your project
 * 2. Make sure your API key (VITE_GOOGLE_DRIVE_API_KEY) has Drive API access
 * 3. In Google Drive, share the parent events folder as "Anyone with the link can view"
 * 4. Set VITE_GOOGLE_DRIVE_FOLDER_ID in your .env.local to the parent folder ID
 * 
 * FOLDER STRUCTURE IN GOOGLE DRIVE:
 *   📁 VENSA Events (parent folder)
 *     📁 2026-01-21 Spring GBM 1
 *       🖼️ photo1.jpg
 *       🖼️ photo2.jpg
 *     📁 2026-01-23 Bonfire
 *       🖼️ photo1.jpg
 *     📁 Resume Workshop
 *       🖼️ photo1.jpg
 */

const API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY || import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;
const FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

// Simple in-memory cache
let cache = { data: null, timestamp: null, ttl: 5 * 60 * 1000 };

/**
 * Get a publicly viewable image URL for a Google Drive file.
 * Uses lh3.googleusercontent.com which works reliably on any domain.
 * The thumbnail endpoint gets blocked by Google on production sites.
 */
function getDriveImageUrl(fileId) {
  return `https://lh3.googleusercontent.com/d/${fileId}=w800`;
}

/**
 * Get fallback image URLs in case the primary one fails
 */
function getDriveImageFallbacks(fileId) {
  return [
    `https://lh3.googleusercontent.com/d/${fileId}=w800`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
  ];
}

/**
 * Get a full-size view link for a Google Drive file
 */
function getDriveViewLink(fileId) {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

/**
 * Parse event folder name to extract date and event name
 * Supports formats: "2026-01-21 Spring GBM 1", "Bonfire", etc.
 */
function parseEventFolderName(folderName) {
  const datePattern = /^(\d{4}-\d{2}-\d{2})\s+(.+)$/;
  const match = folderName.match(datePattern);

  if (match) {
    return { eventDate: match[1], eventName: match[2] };
  }
  return { eventDate: null, eventName: folderName };
}

/**
 * Fetch all subfolders (events) from the parent Google Drive folder
 */
async function listEventFolders() {
  if (!API_KEY || !FOLDER_ID) {
    console.warn('⚠️ Google Drive API key or folder ID not configured');
    return [];
  }

  const q = `'${FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const fields = 'files(id,name,createdTime,modifiedTime)';

  const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&orderBy=name+desc&key=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Drive API error: ${response.status}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Fetch all image files inside a specific folder
 */
async function listFolderPhotos(folderId) {
  const q = `'${folderId}' in parents and (mimeType contains 'image/') and trashed=false`;
  const fields = 'files(id,name,mimeType,thumbnailLink,webViewLink,size)';

  const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&orderBy=name&pageSize=100&key=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) return [];

  const data = await response.json();
  return (data.files || []).map(file => ({
    id: file.id,
    name: file.name,
    url: getDriveImageUrl(file.id),
    fallbacks: getDriveImageFallbacks(file.id),
    viewLink: getDriveViewLink(file.id),
    size: file.size,
  }));
}

/**
 * Fetch all events with their photos from Google Drive
 * This is the main function to call from your component.
 * Returns an array of event objects with photos.
 */
export async function fetchDriveEvents() {
  // Check cache
  const now = Date.now();
  if (cache.data && cache.timestamp && (now - cache.timestamp) < cache.ttl) {
    return cache.data;
  }

  const folders = await listEventFolders();

  const events = await Promise.all(
    folders.map(async (folder) => {
      const { eventName, eventDate } = parseEventFolderName(folder.name);
      const photos = await listFolderPhotos(folder.id);

      return {
        id: folder.id,
        name: eventName,
        title: eventName,
        date: eventDate,
        folderName: folder.name,
        photos,
        photoCount: photos.length,
        // Use first photo as cover image
        imageUrl: photos.length > 0 ? photos[0].url : null,
      };
    })
  );

  // Only keep events that have photos
  const withPhotos = events.filter(e => e.photos.length > 0);

  cache.data = withPhotos;
  cache.timestamp = now;

  return withPhotos;
}

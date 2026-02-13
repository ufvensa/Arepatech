/**
 * Pending Avatar Storage
 * 
 * Uses IndexedDB to persist a profile picture file across page reloads.
 * This is needed because when email confirmation is enabled, there is no
 * active session at signup time, so the avatar can't be uploaded to Supabase
 * Storage until the user confirms their email and signs in.
 */

const DB_NAME = 'vensa_pending';
const STORE_NAME = 'avatars';
const KEY = 'pending_avatar';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a pending avatar file to IndexedDB.
 * Stores the file's ArrayBuffer, name, and MIME type so it can be
 * reconstructed as a File object later.
 * 
 * @param {File} file - The avatar image file
 * @param {string} userId - The user's ID
 */
export async function savePendingAvatar(file, userId) {
  try {
    const db = await openDB();
    const buffer = await file.arrayBuffer();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(
      { buffer, name: file.name, type: file.type, userId },
      KEY
    );
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    console.log('Pending avatar saved to IndexedDB for user:', userId);
  } catch (err) {
    console.error('Failed to save pending avatar:', err);
  }
}

/**
 * Retrieve the pending avatar from IndexedDB and reconstruct it as a File.
 * Returns null if nothing is stored.
 * 
 * @returns {Promise<{ file: File, userId: string } | null>}
 */
export async function getPendingAvatar() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(KEY);
    const result = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();

    if (!result) return null;

    const file = new File([result.buffer], result.name, { type: result.type });
    return { file, userId: result.userId };
  } catch (err) {
    console.error('Failed to get pending avatar:', err);
    return null;
  }
}

/**
 * Remove the pending avatar from IndexedDB after successful upload.
 */
export async function clearPendingAvatar() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(KEY);
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (err) {
    console.error('Failed to clear pending avatar:', err);
  }
}

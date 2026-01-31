import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class GoogleDriveService {
  constructor() {
    this.driveInstance = null;
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    this.cache = {
      data: null,
      timestamp: null,
      ttl: 5 * 60 * 1000 // 5 minutes cache
    };
  }

  async initialize() {
    if (this.driveInstance) return;

    try {
      const credentialsPath = path.join(__dirname, '../../', process.env.GOOGLE_CREDENTIALS_PATH);
      
      if (!fs.existsSync(credentialsPath)) {
        throw new Error(`Credentials file not found at: ${credentialsPath}`);
      }

      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.readonly']
      });

      this.driveInstance = google.drive({ version: 'v3', auth });
      console.log('✅ Google Drive service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive:', error.message);
      throw error;
    }
  }

  async listEventFolders() {
    await this.initialize();

    // Check cache first
    const now = Date.now();
    if (this.cache.data && this.cache.timestamp && (now - this.cache.timestamp) < this.cache.ttl) {
      console.log('📦 Returning cached event data');
      return this.cache.data;
    }

    try {
      // List all subfolders in the main events folder
      const response = await this.driveInstance.files.list({
        q: `'${this.folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name, createdTime, modifiedTime)',
        orderBy: 'name desc'
      });

      const eventFolders = response.data.files || [];
      console.log(`📁 Found ${eventFolders.length} event folders`);

      // Get photos for each event folder
      const events = await Promise.all(
        eventFolders.map(folder => this.getEventPhotos(folder))
      );

      // Filter out events with no photos
      const eventsWithPhotos = events.filter(event => event.photos.length > 0);

      // Cache the results
      this.cache.data = eventsWithPhotos;
      this.cache.timestamp = now;

      console.log(`✅ Processed ${eventsWithPhotos.length} events with photos`);
      return eventsWithPhotos;
    } catch (error) {
      console.error('❌ Error listing event folders:', error.message);
      throw error;
    }
  }

  async getEventPhotos(folder) {
    try {
      // Parse event info from folder name
      // Expected format: "YYYY-MM-DD Event Name" or "Event Name"
      const { eventName, eventDate } = this.parseEventFolderName(folder.name);

      // List all image files in the folder
      const response = await this.driveInstance.files.list({
        q: `'${folder.id}' in parents and (mimeType contains 'image/') and trashed=false`,
        fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, size)',
        orderBy: 'name'
      });

      const photos = (response.data.files || []).map(file => ({
        id: file.id,
        name: file.name,
        thumbnailUrl: file.thumbnailLink,
        // Use backend proxy URL to serve images
        url: `http://localhost:5000/api/drive/image/${file.id}`,
        viewLink: file.webViewLink,
        size: file.size
      }));

      return {
        id: folder.id,
        name: eventName,
        date: eventDate,
        folderName: folder.name,
        photos,
        photoCount: photos.length
      };
    } catch (error) {
      console.error(`❌ Error getting photos for folder ${folder.name}:`, error.message);
      return {
        id: folder.id,
        name: folder.name,
        date: null,
        folderName: folder.name,
        photos: [],
        photoCount: 0
      };
    }
  }

  parseEventFolderName(folderName) {
    // Try to parse "YYYY-MM-DD Event Name" format
    const datePattern = /^(\d{4}-\d{2}-\d{2})\s+(.+)$/;
    const match = folderName.match(datePattern);

    if (match) {
      return {
        eventDate: match[1],
        eventName: match[2]
      };
    }

    // If no date pattern, just return the folder name as event name
    return {
      eventDate: null,
      eventName: folderName
    };
  }

  async getPhotoById(photoId) {
    await this.initialize();

    try {
      const response = await this.driveInstance.files.get({
        fileId: photoId,
        fields: 'id, name, mimeType, thumbnailLink, webContentLink, webViewLink, size'
      });

      return {
        id: response.data.id,
        name: response.data.name,
        thumbnailUrl: response.data.thumbnailLink,
        url: `http://localhost:5000/api/drive/image/${response.data.id}`,
        viewLink: response.data.webViewLink,
        size: response.data.size
      };
    } catch (error) {
      console.error(`❌ Error getting photo ${photoId}:`, error.message);
      throw error;
    }
  }

  clearCache() {
    this.cache.data = null;
    this.cache.timestamp = null;
    console.log('🗑️ Cache cleared');
  }

  // Expose drive instance for image proxying
  get drive() {
    return this.driveInstance;
  }
}

export default new GoogleDriveService();

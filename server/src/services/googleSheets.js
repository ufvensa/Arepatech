import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.auth = null;
    this.cache = {
      data: new Map(), // Store cache per spreadsheet
      timestamp: new Map(),
      ttl: 60000 // 1 minute cache for form responses
    };
  }

  async initialize() {
    try {
      const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || 
        path.join(__dirname, '../../vensa-photo-gallery-credentials.json');
      
      if (!fs.existsSync(credentialsPath)) {
        throw new Error(`Credentials file not found at: ${credentialsPath}`);
      }

      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets.readonly',
          'https://www.googleapis.com/auth/drive.readonly'
        ]
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      console.log('Google Sheets API initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Sheets API:', error);
      throw error;
    }
  }

  getCacheKey(spreadsheetId, range) {
    return `${spreadsheetId}:${range}`;
  }

  isCacheValid(cacheKey) {
    const timestamp = this.cache.timestamp.get(cacheKey);
    if (!timestamp) return false;
    return Date.now() - timestamp < this.cache.ttl;
  }

  clearCache(spreadsheetId = null) {
    if (spreadsheetId) {
      // Clear cache for specific spreadsheet
      const keysToDelete = [];
      for (const key of this.cache.data.keys()) {
        if (key.startsWith(spreadsheetId)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => {
        this.cache.data.delete(key);
        this.cache.timestamp.delete(key);
      });
    } else {
      // Clear all cache
      this.cache.data.clear();
      this.cache.timestamp.clear();
    }
    console.log(`Cache cleared for ${spreadsheetId || 'all spreadsheets'}`);
  }

  /**
   * Read data from a Google Sheet
   * @param {string} spreadsheetId - The ID of the spreadsheet
   * @param {string} range - The A1 notation range (e.g., 'Sheet1!A1:E100')
   * @returns {Promise<Array>} - Array of rows
   */
  async readSheet(spreadsheetId, range = 'A1:Z1000') {
    if (!this.sheets) {
      await this.initialize();
    }

    const cacheKey = this.getCacheKey(spreadsheetId, range);

    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      console.log(`Returning cached data for ${spreadsheetId}`);
      return this.cache.data.get(cacheKey);
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range
      });

      const rows = response.data.values || [];
      
      // Cache the result
      this.cache.data.set(cacheKey, rows);
      this.cache.timestamp.set(cacheKey, Date.now());

      return rows;
    } catch (error) {
      console.error(`Error reading sheet ${spreadsheetId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get RSVP count from a Google Form responses sheet
   * @param {string} spreadsheetId - The ID of the spreadsheet connected to Google Form
   * @param {string} range - Optional: specific range to read
   * @returns {Promise<Object>} - Object with RSVP count and details
   */
  async getFormResponses(spreadsheetId, range = 'Form Responses 1') {
    try {
      const rows = await this.readSheet(spreadsheetId, range);
      
      if (rows.length === 0) {
        return {
          count: 0,
          responses: [],
          headers: []
        };
      }

      const headers = rows[0]; // First row is typically headers
      const responses = rows.slice(1); // Rest are responses

      return {
        count: responses.length,
        responses: responses.map(row => {
          const response = {};
          headers.forEach((header, index) => {
            response[header] = row[index] || '';
          });
          return response;
        }),
        headers
      };
    } catch (error) {
      console.error(`Error getting form responses:`, error.message);
      throw error;
    }
  }

  /**
   * Get RSVP counts for multiple events
   * Each event should have a spreadsheetId property
   * @param {Array} events - Array of event objects with spreadsheetId
   * @returns {Promise<Object>} - Map of eventId to RSVP count
   */
  async getEventRSVPCounts(events) {
    const rsvpCounts = {};

    for (const event of events) {
      if (event.spreadsheetId) {
        try {
          const data = await this.getFormResponses(event.spreadsheetId);
          rsvpCounts[event.id] = {
            count: data.count,
            responses: data.responses
          };
        } catch (error) {
          console.error(`Failed to get RSVP for event ${event.id}:`, error.message);
          rsvpCounts[event.id] = {
            count: 0,
            responses: [],
            error: error.message
          };
        }
      }
    }

    return rsvpCounts;
  }
}

// Export a singleton instance
const sheetsService = new GoogleSheetsService();
export default sheetsService;

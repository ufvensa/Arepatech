import express from 'express';
import sheetsService from '../services/googleSheets.js';

const router = express.Router();

/**
 * GET /api/sheets/rsvp/:spreadsheetId
 * Get RSVP data from a specific Google Form's response sheet
 */
router.get('/rsvp/:spreadsheetId', async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    const { range } = req.query; // Optional: specify sheet range

    const data = await sheetsService.getFormResponses(
      spreadsheetId,
      range || 'Form Responses 1'
    );

    res.json({
      success: true,
      spreadsheetId,
      rsvpCount: data.count,
      responses: data.responses,
      headers: data.headers
    });
  } catch (error) {
    console.error('Error fetching RSVP data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch RSVP data',
      message: error.message
    });
  }
});

/**
 * GET /api/sheets/rsvp-count/:spreadsheetId
 * Get just the RSVP count (lighter response)
 */
router.get('/rsvp-count/:spreadsheetId', async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    const { range } = req.query;

    const data = await sheetsService.getFormResponses(
      spreadsheetId,
      range || 'Form Responses 1'
    );

    res.json({
      success: true,
      spreadsheetId,
      count: data.count
    });
  } catch (error) {
    console.error('Error fetching RSVP count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch RSVP count',
      message: error.message,
      count: 0
    });
  }
});

/**
 * POST /api/sheets/refresh/:spreadsheetId
 * Clear cache for a specific spreadsheet
 */
router.post('/refresh/:spreadsheetId', (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    sheetsService.clearCache(spreadsheetId);
    
    res.json({
      success: true,
      message: `Cache cleared for spreadsheet ${spreadsheetId}`
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

/**
 * POST /api/sheets/refresh-all
 * Clear all sheets cache
 */
router.post('/refresh-all', (req, res) => {
  try {
    sheetsService.clearCache();
    
    res.json({
      success: true,
      message: 'All sheets cache cleared'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

/**
 * POST /api/sheets/batch-rsvp
 * Get RSVP counts for multiple events
 * Body: { events: [{ id, spreadsheetId }, ...] }
 */
router.post('/batch-rsvp', async (req, res) => {
  try {
    const { events } = req.body;

    if (!Array.isArray(events)) {
      return res.status(400).json({
        success: false,
        error: 'Events must be an array'
      });
    }

    const rsvpCounts = await sheetsService.getEventRSVPCounts(events);

    res.json({
      success: true,
      rsvpCounts
    });
  } catch (error) {
    console.error('Error fetching batch RSVP data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch batch RSVP data',
      message: error.message
    });
  }
});

export default router;

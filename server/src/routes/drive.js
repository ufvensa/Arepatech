import express from 'express';
import googleDriveService from '../services/googleDrive.js';

const router = express.Router();

// GET /api/drive/events - Get all events with photos from Google Drive
router.get('/events', async (req, res) => {
  try {
    const events = await googleDriveService.listEventFolders();
    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error fetching events from Google Drive:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events from Google Drive',
      message: error.message
    });
  }
});

// GET /api/drive/events/:eventId - Get specific event details
router.get('/events/:eventId', async (req, res) => {
  try {
    const events = await googleDriveService.listEventFolders();
    const event = events.find(e => e.id === req.params.eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event',
      message: error.message
    });
  }
});

// GET /api/drive/photos/:photoId - Get specific photo details
router.get('/photos/:photoId', async (req, res) => {
  try {
    const photo = await googleDriveService.getPhotoById(req.params.photoId);
    res.json({
      success: true,
      photo
    });
  } catch (error) {
    console.error('Error fetching photo:', error);
    res.status(404).json({
      success: false,
      error: 'Photo not found',
      message: error.message
    });
  }
});

// POST /api/drive/refresh - Clear cache and refresh data
router.post('/refresh', async (req, res) => {
  try {
    googleDriveService.clearCache();
    const events = await googleDriveService.listEventFolders();
    res.json({
      success: true,
      message: 'Cache cleared and data refreshed',
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh data',
      message: error.message
    });
  }
});

// GET /api/drive/image/:fileId - Proxy image from Google Drive
router.get('/image/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Initialize the drive service
    await googleDriveService.initialize();
    
    // Get file metadata
    const file = await googleDriveService.drive.files.get({
      fileId: fileId,
      fields: 'mimeType, name'
    });

    // Get the file content
    const response = await googleDriveService.drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    // Set appropriate headers
    res.setHeader('Content-Type', file.data.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

    // Pipe the image data to response
    response.data.pipe(res);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(404).json({
      success: false,
      error: 'Image not found',
      message: error.message
    });
  }
});

export default router;

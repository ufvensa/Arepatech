// Import event category images
import gbmImage from '../images/VENSA GBM.png';
import bonfireImage from '../images/VENSA Bonfire.png';
import resumeWorkshopImage from '../images/VENSA Resume Workshop.png';
import pilatesImage from '../images/VENSA Pilates.png';
import eboardImage from '../images/VENSA Eboard.png';
import vensaLogo from '../images/VENSA Website Logo.png';
import valentineBbqImage from '../images/VENSA Valentines BBQ.jpeg';

/**
 * To enable RSVP functionality for an event:
 * 1. Create a Google Form for the event
 * 2. In the form settings, link it to a Google Spreadsheet (Form -> Responses -> Link to Sheets)
 * 3. Share the spreadsheet with: vensa-drive-access@vensa-photo-gallery.iam.gserviceaccount.com
 * 4. Add to the calendar event description in this format:
 *    FORM_URL: https://forms.gle/YOUR_FORM_ID
 *    SPREADSHEET_ID: YOUR_SPREADSHEET_ID_HERE
 * 
 * The spreadsheet ID is found in the URL: 
 * https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
 */

const API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;
const CALENDAR_IDS = import.meta.env.VITE_GOOGLE_CALENDAR_IDS?.split(',') || [];

// Map event keywords to images
const EVENT_IMAGE_MAP = [
  { keywords: ['gbm', 'general body meeting', 'general meeting'], image: gbmImage },
  { keywords: ['bonfire', 'social', 'mixer', 'networking'], image: bonfireImage },
  { keywords: ['resume', 'workshop', 'career', 'professional', 'opening'], image: resumeWorkshopImage },
  { keywords: ['pilates', 'yoga', 'fitness', 'wellness', 'exercise'], image: pilatesImage },
  { keywords: ['eboard', 'e-board', 'executive', 'leadership'], image: eboardImage },
  { keywords: ['valentine', 'day', 'bbq', 'annual'], image: valentineBbqImage },
  // Add more mappings as needed
];

function getEventImage(eventTitle) {
  const titleLower = eventTitle.toLowerCase();
  
  // Check if title matches any keyword patterns
  for (const mapping of EVENT_IMAGE_MAP) {
    if (mapping.keywords.some(keyword => titleLower.includes(keyword))) {
      return mapping.image;
    }
  }
  
  // Default to VENSA logo if no match
  return vensaLogo;
}

export async function fetchCalendarEvents() {
  try {
    console.log('API Key:', API_KEY ? 'Present' : 'Missing');
    console.log('Calendar IDs:', CALENDAR_IDS.length);
    
    const timeMin = new Date();
    timeMin.setMonth(timeMin.getMonth() - 6); // Get events from 6 months ago
    
    const timeMax = new Date();
    timeMax.setMonth(timeMax.getMonth() + 6); // Get events up to 6 months ahead

    // Fetch events from all calendars in parallel
    const allEventsPromises = CALENDAR_IDS.map(async (calendarId) => {
      try {
        const trimmedId = calendarId.trim();
        // Add fields parameter to include attachments
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(trimmedId)}/events?key=${API_KEY}&timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`;

        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`Failed to fetch from calendar:`, response.status);
          return [];
        }

        const data = await response.json();
        return data.items || [];
      } catch (error) {
        console.error(`Error fetching calendar:`, error);
        return [];
      }
    });

    const allEventsArrays = await Promise.all(allEventsPromises);
    const allEvents = allEventsArrays.flat();
    
    // Sort all events by start time
    allEvents.sort((a, b) => {
      const startA = new Date(a.start.dateTime || a.start.date);
      const startB = new Date(b.start.dateTime || b.start.date);
      return startA - startB;
    });

    console.log('Total events fetched:', allEvents.length);
    return allEvents;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

export function parseCalendarEvent(event) {
  const start = event.start.dateTime || event.start.date;
  const end = event.end.dateTime || event.end.date;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const title = event.summary || event.title || 'Event';
  const description = event.description || '';

  // Use local images based on event title keywords
  const imageUrl = getEventImage(title);

  // Strip HTML tags from description before parsing
  // Remove anchor tags but keep only the inner text (not the href) to avoid duplication
  let cleanDescription = description
    .replace(/<a[^>]*>([^<]*)<\/a>/gi, '$1') // Replace <a href="...">text</a> with just text
    .replace(/<br\s*\/?>/gi, ' ') // Replace <br> with space
    .replace(/<[^>]*>/g, ''); // Remove any remaining HTML tags

  // Debug: Log the cleaned description to see what we're parsing
  if (cleanDescription.includes('FORM_URL')) {
    console.log('Cleaned description for', event.summary, ':', cleanDescription);
  }

  // Extract Google Form URL and Spreadsheet ID from description
  // Format: FORM_URL: https://forms.gle/xyz
  //         SPREADSHEET_ID: abc123def456
  let formUrl = null;
  let spreadsheetId = null;

  const formUrlMatch = cleanDescription.match(/FORM_URL:\s*(https?:\/\/[^\s]+)/i);
  const spreadsheetIdMatch = cleanDescription.match(/SPREADSHEET_ID:\s*([^\s]+)/i);

  if (formUrlMatch) {
    formUrl = formUrlMatch[1];
    console.log('Extracted formUrl:', formUrl);
  }
  if (spreadsheetIdMatch) {
    spreadsheetId = spreadsheetIdMatch[1];
    console.log('Extracted spreadsheetId:', spreadsheetId);
  }

  if (formUrlMatch) {
    formUrl = formUrlMatch[1].trim();
  }

  if (spreadsheetIdMatch) {
    spreadsheetId = spreadsheetIdMatch[1].trim();
  }

  return {
    id: event.id,
    title: title,
    description: description,
    location: event.location || 'TBD',
    imageUrl: imageUrl,
    startDate: startDate,
    endDate: endDate,
    startDateFormatted: startDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }),
    startTime: startDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }),
    isPast: endDate < new Date(),
    isUpcoming: startDate > new Date(),
    formUrl: formUrl,
    spreadsheetId: spreadsheetId,
  };
}

export function separateEvents(events) {
  const now = new Date();
  const parsedEvents = events.map(parseCalendarEvent);
  
  // Upcoming events: events that START in the future
  const upcomingEvents = parsedEvents.filter(event => event.startDate > now);
  
  // Past events: events that have already started (even if still ongoing)
  const pastEvents = parsedEvents.filter(event => event.startDate <= now);

  console.log(`Found ${upcomingEvents.length} upcoming events and ${pastEvents.length} past events`);

  return {
    upcoming: upcomingEvents,
    past: pastEvents.reverse() // Most recent past events first
  };
}

# Google Forms RSVP System - Architecture Overview

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER CREATES EVENT                           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌────────────────────────────────────────────┐
         │  1. Create Google Form                     │
         │     - Add RSVP fields (Name, Email, etc.)  │
         └────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌────────────────────────────────────────────┐
         │  2. Link Form to Google Sheets             │
         │     - Auto-creates spreadsheet             │
         │     - Form responses → Sheet rows          │
         └────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌────────────────────────────────────────────┐
         │  3. Share Spreadsheet                      │
         │     vensa-drive-access@...                 │
         │     (Service Account - Viewer permission)  │
         └────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌────────────────────────────────────────────┐
         │  4. Add to Google Calendar Event           │
         │                                            │
         │     Description:                           │
         │     FORM_URL: https://forms.gle/abc123    │
         │     SPREADSHEET_ID: 1XyZ...                │
         └────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         WEBSITE INTEGRATION                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌────────────────┐
│  GOOGLE CALENDAR │         │  GOOGLE SHEETS   │         │  GOOGLE FORM   │
│                  │         │                  │         │                │
│  Event Info      │         │  Form Responses  │         │  RSVP Fields   │
│  + FORM_URL      │         │  Row 1: Headers  │         │                │
│  + SPREADSHEET_ID│         │  Row 2+: Data    │         │  User fills    │
└────────┬─────────┘         └────────┬─────────┘         └────────┬───────┘
         │                            │                            │
         │ Fetch events               │ Read responses            │ Submit
         │                            │                            │
         ▼                            ▼                            ▼
    ┌────────────────────────────────────────────────────────────────┐
    │              VENSA WEBSITE BACKEND (Node.js)                   │
    │  ┌──────────────────────────────────────────────────────────┐  │
    │  │  Google Calendar API                                     │  │
    │  │  - Fetches event data                                    │  │
    │  │  - Parses FORM_URL and SPREADSHEET_ID from description   │  │
    │  └──────────────────────────────────────────────────────────┘  │
    │  ┌──────────────────────────────────────────────────────────┐  │
    │  │  Google Sheets API                                       │  │
    │  │  - Reads form responses from spreadsheet                 │  │
    │  │  - Counts total responses                                │  │
    │  │  - 1-minute cache (refreshes automatically)              │  │
    │  └──────────────────────────────────────────────────────────┘  │
    │  ┌──────────────────────────────────────────────────────────┐  │
    │  │  API Endpoints                                           │  │
    │  │  GET  /api/sheets/rsvp-count/:spreadsheetId             │  │
    │  │  GET  /api/sheets/rsvp/:spreadsheetId                   │  │
    │  │  POST /api/sheets/refresh/:spreadsheetId                │  │
    │  └──────────────────────────────────────────────────────────┘  │
    └────────────────────────────────┬───────────────────────────────┘
                                     │ JSON Response
                                     │ { count: 42 }
                                     ▼
    ┌────────────────────────────────────────────────────────────────┐
    │              VENSA WEBSITE FRONTEND (React)                    │
    │  ┌──────────────────────────────────────────────────────────┐  │
    │  │  Events Page (Events.jsx)                                │  │
    │  │  ┌────────────────────────────────────────────────────┐  │  │
    │  │  │  Event Card                                        │  │  │
    │  │  │  ┌──────────────────────────────────────────────┐  │  │  │
    │  │  │  │  Spring GBM 2026                             │  │  │  │
    │  │  │  │  Date: Feb 15, 2026                          │  │  │  │
    │  │  │  │  Location: Reitz Union                       │  │  │  │
    │  │  │  │  👥 42 RSVPs  ← Live count from Sheets       │  │  │  │
    │  │  │  │  [RSVP Now] ← Opens Google Form              │  │  │  │
    │  │  │  └──────────────────────────────────────────────┘  │  │  │
    │  │  └────────────────────────────────────────────────────┘  │  │
    │  └──────────────────────────────────────────────────────────┘  │
    └────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │  STUDENT SEES:  │
                            │  • Event details│
                            │  • RSVP count   │
                            │  • RSVP button  │
                            └─────────────────┘
```

## Data Flow Example

### 1. Event Creation
```
Calendar Event: "Spring GBM 2026"
Description: 
  Join us for our Spring General Body Meeting!
  
  FORM_URL: https://forms.gle/SpringGBM2026
  SPREADSHEET_ID: 1abc123def456ghi789
```

### 2. Student RSVPs
```
1. Student visits website → Sees event with "👥 15 RSVPs"
2. Clicks "RSVP Now" → Opens Google Form in new tab
3. Fills form (Name, Email, etc.) → Submits
4. Google Form → Saves response to Google Sheet
5. Sheet now has 16 rows (1 header + 16 responses)
```

### 3. Website Updates
```
1. Next visitor loads Events page
2. Frontend calls: GET /api/sheets/rsvp-count/1abc123def456ghi789
3. Backend (cached 1 min ago):
   - Returns cached count: 15
   OR (if cache expired):
   - Fetches from Google Sheets
   - Counts rows: 16 data rows
   - Returns: { count: 16 }
   - Caches for 1 minute
4. Frontend displays: "👥 16 RSVPs"
```

## Technical Implementation

### Backend Files Created
```
server/src/services/googleSheets.js
  - GoogleSheetsService class
  - Authenticates with service account
  - Reads spreadsheet data
  - Implements 1-minute caching

server/src/routes/sheets.js
  - Express routes for RSVP data
  - /api/sheets/rsvp-count/:id
  - /api/sheets/rsvp/:id (full data)
  - /api/sheets/refresh/:id
```

### Frontend Files Modified
```
client/src/pages/Events.jsx
  - Added rsvpCounts state
  - Fetches RSVP counts on load
  - Displays count with 👥 icon
  - RSVP button opens form URL

client/src/lib/calendar.js
  - Parses FORM_URL from event description
  - Parses SPREADSHEET_ID from event description
  - Adds formUrl and spreadsheetId to event objects
```

## Security & Privacy

✅ **Service Account Permissions:**
   - Read-only access to shared sheets
   - Cannot modify or delete data
   - No public access - must be explicitly shared

✅ **Data Exposure:**
   - Only RSVP COUNT is displayed publicly
   - Individual responses are NOT shown
   - Personal information stays private

✅ **API Access:**
   - Backend proxies all requests
   - Service account credentials never exposed to frontend
   - Rate limiting through caching (1-minute TTL)

## Cache Strategy

**Why 1-minute cache?**
- Balance between fresh data and API quota
- Google Sheets API has usage limits
- RSVP counts don't need real-time updates
- Reduces server load

**How to force refresh:**
```powershell
# Manually refresh cache for a specific event
Invoke-RestMethod -Uri "http://localhost:5000/api/sheets/refresh/SPREADSHEET_ID" -Method Post
```

## Cost & Quotas

**Google Sheets API:**
- FREE tier: 60 requests/minute per user
- With caching: ~1 request per event per minute
- For 10 events: 10 requests/minute = well within limits

**Google Forms:**
- Unlimited form submissions
- Unlimited form responses
- FREE for all Google Workspace accounts

## Future Enhancements

Possible improvements:
1. **Real-time updates** - WebSocket/SSE for live counts
2. **Attendee list** - Display names of RSVPs (with consent)
3. **Check-in system** - Mark attendees as "checked in" at event
4. **Analytics** - Track RSVP trends, no-show rates
5. **Email notifications** - Auto-send confirmations
6. **Waitlist** - For events with capacity limits
7. **QR codes** - Generate QR codes for quick check-in

## Maintenance

**Regular Tasks:**
- Monitor Google API quotas
- Check service account permissions
- Review form response data
- Update cache duration if needed

**No Maintenance Required:**
- Forms/Sheets continue working automatically
- Calendar events sync automatically
- Service account credentials don't expire
- No database to maintain

---

## Summary

This system provides **fully automated RSVP tracking** with:
- ✅ Zero manual data entry
- ✅ Real-time(ish) RSVP counts (1-min cache)
- ✅ Simple setup for each event
- ✅ Free to use (Google APIs)
- ✅ Secure & private
- ✅ Low maintenance

Perfect for VENSA's event management needs! 🎉

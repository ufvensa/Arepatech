# Google Forms RSVP Integration - Setup Guide

## Overview
This system automatically reads Google Form responses from Google Sheets and displays live RSVP counts on your Events page.

## Service Account Email
```
vensa-drive-access@vensa-photo-gallery.iam.gserviceaccount.com
```
**Important:** You must share your Google Sheets with this email address for the system to access them.

---

## How It Works

1. **Create a Google Form** for event RSVPs
2. **Link Form to Google Sheets** (Form responses are automatically saved)
3. **Share the Spreadsheet** with the service account
4. **Add Form URL and Spreadsheet ID** to your calendar event description
5. **Website automatically displays** live RSVP counts

---

## Step-by-Step Setup for Each Event

### Step 1: Create a Google Form

1. Go to [Google Forms](https://forms.google.com)
2. Create a new form with fields like:
   - Name (required)
   - Email (required)
   - UF ID (optional)
   - Dietary restrictions (optional)
   - Any other relevant fields

### Step 2: Link Form to Google Sheets

1. In your form, click the **"Responses"** tab
2. Click the Google Sheets icon (green icon with white grid)
3. Choose "Create a new spreadsheet"
4. Name it (e.g., "VENSA GBM Spring 2026 RSVPs")
5. Click **"Create"**

This automatically creates a spreadsheet and links form responses to it.

### Step 3: Get the Spreadsheet ID

1. Open the linked spreadsheet
2. Look at the URL in your browser:
   ```
   https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0/edit
                                         ^^^^^^^^^^^^^^^^
                                         This is the Spreadsheet ID
   ```
3. Copy the Spreadsheet ID (the long string between `/d/` and `/edit`)

### Step 4: Share Spreadsheet with Service Account

1. In your spreadsheet, click **"Share"** (top-right corner)
2. Add this email: `vensa-drive-access@vensa-photo-gallery.iam.gserviceaccount.com`
3. Set permission to **"Viewer"** (read-only)
4. Uncheck "Notify people" (no need to send email)
5. Click **"Share"**

### Step 5: Add Info to Calendar Event

1. Go to your Google Calendar
2. Open the event you want to enable RSVPs for
3. Click "Edit event"
4. In the **Description** field, add these two lines:

   ```
   FORM_URL: https://forms.gle/YOUR_FORM_SHORT_URL
   SPREADSHEET_ID: YOUR_SPREADSHEET_ID_HERE
   ```

   **Example:**
   ```
   Join us for our Spring General Body Meeting!

   FORM_URL: https://forms.gle/abc123xyz789
   SPREADSHEET_ID: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9
   ```

5. Save the event

### Step 6: Get the Google Form Short URL

1. In your Google Form, click **"Send"** (top-right)
2. Click the link icon (🔗)
3. Check "Shorten URL"
4. Copy the short URL (e.g., `https://forms.gle/abc123`)
5. Use this URL in your calendar event description

---

## What Happens Next

Once you complete these steps:

1. ✅ The RSVP button on your Events page will open the Google Form
2. ✅ When users submit the form, responses are automatically saved to Google Sheets
3. ✅ Your website fetches the response count every time someone loads the Events page
4. ✅ The live RSVP count appears on each event card: **"👥 12 RSVPs"**
5. ✅ Cache updates every 1 minute, so counts stay fresh

---

## Example: Complete Setup

Let's say you're hosting "Spring GBM 2026":

1. **Create form:** "VENSA Spring GBM 2026 RSVP"
2. **Link to Sheets:** Creates spreadsheet with ID `1XyZ...abc`
3. **Share with:** `vensa-drive-access@vensa-photo-gallery.iam.gserviceaccount.com`
4. **Get form URL:** `https://forms.gle/SpringGBM2026`
5. **Calendar description:**
   ```
   Join us for our Spring 2026 General Body Meeting! 
   We'll have food, activities, and great company.

   FORM_URL: https://forms.gle/SpringGBM2026
   SPREADSHEET_ID: 1XyZaBcDeF123456789ghijklmnop
   ```

---

## API Endpoints Available

Your backend now has these endpoints:

### Get RSVP Count (lightweight)
```
GET http://localhost:5000/api/sheets/rsvp-count/:spreadsheetId
```

**Response:**
```json
{
  "success": true,
  "spreadsheetId": "1XyZ...",
  "count": 42
}
```

### Get Full RSVP Data (with responses)
```
GET http://localhost:5000/api/sheets/rsvp/:spreadsheetId
```

**Response:**
```json
{
  "success": true,
  "spreadsheetId": "1XyZ...",
  "rsvpCount": 42,
  "responses": [
    {
      "Timestamp": "2026/01/31 10:30:00 AM EST",
      "Name": "John Doe",
      "Email": "john@ufl.edu",
      "UF ID": "12345678"
    }
  ],
  "headers": ["Timestamp", "Name", "Email", "UF ID"]
}
```

### Refresh Cache
```
POST http://localhost:5000/api/sheets/refresh/:spreadsheetId
```
Forces a fresh fetch from Google Sheets (bypasses 1-minute cache).

---

## Testing Your Setup

1. **Start your servers:**
   ```powershell
   # Terminal 1 - Backend
   cd "c:\Users\Andy Arvelo\Desktop\UF\VENSA\Arepatech\server"
   npm run dev

   # Terminal 2 - Frontend
   cd "c:\Users\Andy Arvelo\Desktop\UF\VENSA\Arepatech\client"
   npm run dev
   ```

2. **Test API directly:**
   ```powershell
   # Replace YOUR_SPREADSHEET_ID with your actual ID
   Invoke-RestMethod -Uri "http://localhost:5000/api/sheets/rsvp-count/YOUR_SPREADSHEET_ID"
   ```

3. **Check your Events page:**
   - Go to http://localhost:5173/events
   - You should see RSVP counts appear under events that have spreadsheetId configured
   - Click "RSVP Now" to open the Google Form

---

## Troubleshooting

### "Failed to fetch RSVP data"
- ✅ Make sure the spreadsheet is shared with the service account
- ✅ Verify the spreadsheet ID is correct
- ✅ Check that the sheet name is "Form Responses 1" (default name)

### RSVP count shows 0
- ✅ Make sure the form has actual responses
- ✅ Check that responses are going to the correct sheet
- ✅ Verify the sheet is properly linked to the form

### RSVP button says "not available"
- ✅ Make sure you added `FORM_URL:` to the calendar event description
- ✅ Check the format is exactly: `FORM_URL: https://forms.gle/...`

### Cache not updating
- ✅ Wait 1 minute (cache TTL)
- ✅ Or manually refresh: `POST http://localhost:5000/api/sheets/refresh/:spreadsheetId`

---

## Security Notes

- ✅ The service account only has READ access to sheets
- ✅ Spreadsheets must be explicitly shared (not public)
- ✅ Form responses are never exposed publicly
- ✅ Only RSVP counts are displayed on the website (not personal info)

---

## Future Enhancements

You could add:
- Display attendee names (with privacy considerations)
- RSVP status (Attending/Maybe/Not Attending)
- Real-time updates using webhooks
- Download attendee list as CSV
- Send confirmation emails to RSVPs

---

## Questions?

If something doesn't work:
1. Check the browser console for errors (F12)
2. Check server logs in your terminal
3. Verify all setup steps are completed
4. Test the API endpoint directly with PowerShell

Enjoy your automated RSVP system! 🎉

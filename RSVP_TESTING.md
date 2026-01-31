# Google Forms RSVP Integration - Quick Test

## Test with a Sample Spreadsheet

To test the integration, you need:
1. A Google Spreadsheet with form responses
2. The spreadsheet shared with: vensa-drive-access@vensa-photo-gallery.iam.gserviceaccount.com
3. The spreadsheet ID

### Quick Test Commands

Once you have a spreadsheet set up, test it:

```powershell
# Replace YOUR_SPREADSHEET_ID with your actual spreadsheet ID

# Test 1: Get RSVP count
Invoke-RestMethod -Uri "http://localhost:5000/api/sheets/rsvp-count/YOUR_SPREADSHEET_ID"

# Test 2: Get full RSVP data (includes responses)
Invoke-RestMethod -Uri "http://localhost:5000/api/sheets/rsvp/YOUR_SPREADSHEET_ID"

# Test 3: Refresh cache
Invoke-RestMethod -Uri "http://localhost:5000/api/sheets/refresh/YOUR_SPREADSHEET_ID" -Method Post
```

### Example Test Calendar Event

To test on your Events page, edit a calendar event and add this to the description:

```
FORM_URL: https://forms.gle/YOUR_FORM_SHORT_URL
SPREADSHEET_ID: YOUR_SPREADSHEET_ID
```

Then visit http://localhost:5173/events and you should see:
- RSVP count displayed under the event
- RSVP Now button opens the Google Form

### Creating a Test Form

1. Go to https://forms.google.com
2. Create a quick form with just "Name" and "Email"
3. Go to Responses → Link to Sheets → Create new spreadsheet
4. Share the spreadsheet with the service account
5. Copy the spreadsheet ID from the URL
6. Get the form short URL
7. Add both to your calendar event description
8. Test!

### Spreadsheet Format Expected

The system expects a sheet named "Form Responses 1" (default Google Forms name) with:
- Row 1: Headers (Timestamp, Name, Email, etc.)
- Row 2+: Form responses

If your sheet has a different name, you can specify it:
```
http://localhost:5000/api/sheets/rsvp-count/SPREADSHEET_ID?range=SheetName
```

### Troubleshooting Test Errors

If you get errors:

**Error: "Failed to fetch RSVP data"**
- Check that spreadsheet is shared with service account
- Verify spreadsheet ID is correct

**Error: "Credentials file not found"**
- Ensure vensa-photo-gallery-credentials.json exists in server folder

**Error: "The caller does not have permission"**
- The spreadsheet hasn't been shared with the service account

**Success Response Example:**
```json
{
  "success": true,
  "spreadsheetId": "1abc...",
  "count": 5
}
```

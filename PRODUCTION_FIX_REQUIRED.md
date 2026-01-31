# URGENT: Production Environment Variables Missing

## Problem
The main branch at ufvensa.com shows "No upcoming events" because the Google Calendar API credentials are not configured in production.

## Why This Happened
- `.env` files are in `.gitignore` (correct for security)
- Environment variables exist locally but not in production
- The pull request merged code but couldn't include `.env`

## Solution: Add Environment Variables to Production

### Required Variables
```
VITE_GOOGLE_CALENDAR_API_KEY=AIzaSyBog2E96kP49XrL3KIIiUKtd1eYdr4BJKA
VITE_GOOGLE_CALENDAR_IDS=ufvensa@gmail.com,a70923bff5b65c2e9aee55719a7cec50d4bbdbe99adf482dc503b9309fc3c0d9@group.calendar.google.com,a56c003231fba0e0e8b354bb6739cf7c033234790cf95c9bf5a96608413c854b@group.calendar.google.com,003cd1e11fd7cfc7f1e7a354437fee259a7330af78235f3dfa15ca75b64d5e87@group.calendar.google.com,c4640f20398a20a28b9273e827b62a72abaf79b59bf07580b0bccbe53141fb4f@group.calendar.google.com,40455cdfe711ed6af391736af5d9ad55c003d057284a18b152285776d1b9f7ed@group.calendar.google.com,e97ce75f11112117f77f758d8a9f2eb1deb4ead7cb9a3648dcdfad424716279c@group.calendar.google.com,01aee50cf1481318494c4b15a86443cc571bca8d9224375a51863236a1e83adf@group.calendar.google.com,1596f073408c267b7599ba2bd2d7d5808eccf81c0b6943adb3ad78c9f6658ec2@group.calendar.google.com,d8e060c45ab7a371da219821910830750ae80e94b479fe50001ed0a7ad66e780@group.calendar.google.com,aef07e99943f5c721ccdaa392646850793f2bdd8b8ab8f3fdeb279e7f5ec1a5b@group.calendar.google.com
```

---

## Step-by-Step Fix (Choose Your Platform)

### If Using **Netlify**:

1. Go to https://app.netlify.com
2. Select your VENSA website project
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add both variables:
   - Key: `VITE_GOOGLE_CALENDAR_API_KEY`
   - Value: `AIzaSyBog2E96kP49XrL3KIIiUKtd1eYdr4BJKA`
   
   - Key: `VITE_GOOGLE_CALENDAR_IDS`
   - Value: (paste the long comma-separated list above)
6. Click **Save**
7. Go to **Deploys** → **Trigger deploy** → **Deploy site**

### If Using **Vercel**:

1. Go to https://vercel.com/dashboard
2. Select your VENSA project
3. Go to **Settings** → **Environment Variables**
4. Add both variables:
   - Name: `VITE_GOOGLE_CALENDAR_API_KEY`
   - Value: `AIzaSyBog2E96kP49XrL3KIIiUKtd1eYdr4BJKA`
   - Environments: Check **Production**, **Preview**, **Development**
   
   - Name: `VITE_GOOGLE_CALENDAR_IDS`
   - Value: (paste the long comma-separated list above)
   - Environments: Check all three
5. Click **Save**
6. Go to **Deployments** → **Redeploy** (on latest deployment)

### If Using **GitHub Pages** with Actions:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add both secrets:
   - Name: `VITE_GOOGLE_CALENDAR_API_KEY`
   - Secret: `AIzaSyBog2E96kP49XrL3KIIiUKtd1eYdr4BJKA`
   
   - Name: `VITE_GOOGLE_CALENDAR_IDS`
   - Secret: (paste the long list)
5. Update your GitHub Actions workflow to use these secrets
6. Re-run the workflow or push a new commit

### If Using **Other Platform** (cPanel, custom server, etc.):

1. SSH into your server or use hosting control panel
2. Navigate to your project directory
3. Create/edit `.env` file:
   ```bash
   nano .env
   ```
4. Add the two variables
5. Save and restart your application

---

## Testing After Fix

1. **Wait for deployment** to complete (~2-5 minutes)
2. **Clear browser cache** (Ctrl + Shift + R or Cmd + Shift + R)
3. Visit https://ufvensa.com/events
4. **Open browser console** (F12)
5. Look for these logs:
   ```
   API Key: Present
   Calendar IDs: 11
   Total events fetched: X
   Found X upcoming events and X past events
   ```

If you see "API Key: Missing" or "Calendar IDs: 0", the environment variables aren't loading correctly.

---

## Quick Verification Commands

### Check if Variables are Set (in production build):

```javascript
// Open browser console on ufvensa.com/events and run:
console.log('API Key:', import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY ? 'Present' : 'Missing');
console.log('Calendar IDs:', import.meta.env.VITE_GOOGLE_CALENDAR_IDS);
```

---

## Prevention: Update .env.example

To prevent this in the future, make sure `.env.example` includes these variables:

```bash
# In client/.env.example
VITE_GOOGLE_CALENDAR_API_KEY=your-api-key-here
VITE_GOOGLE_CALENDAR_IDS=calendar1@gmail.com,calendar2@group.calendar.google.com
```

Then commit this file so team members know what variables are needed.

---

## Important Notes

⚠️ **Security Reminder:**
- Never commit `.env` to Git (it's in `.gitignore` - keep it that way)
- The API key shown here is restricted to Calendar API only
- If compromised, regenerate it in Google Cloud Console

✅ **After Adding Variables:**
- Production site will work exactly like your local branch
- Events will display automatically
- No code changes needed

---

## Contact

If you need help setting up environment variables on your specific hosting platform, let me know which service you're using (Netlify, Vercel, etc.) and I can provide detailed instructions.

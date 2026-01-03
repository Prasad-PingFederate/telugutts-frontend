# Google Analytics Setup Instructions

## What I've Done:
✅ Added Google Analytics (GA4) tracking code to your website
✅ The code is in the `<head>` section of `index.html`

## What You Need to Do:

### 1. Create Google Analytics Account
- Visit: https://analytics.google.com/
- Sign in with your Google account
- Click "Start measuring"
- Create account: "Telugu TTS" (or any name you prefer)
- Create property: "telugutts.com"
- Select your timezone and currency
- Accept Terms of Service

### 2. Get Your Measurement ID
- After setup, you'll see a Measurement ID like: `G-ABC123DEF4`
- Copy this ID

### 3. Update index.html
- Open `index.html`
- Find `G-XXXXXXXXXX` (appears 2 times in lines 11 and 16)
- Replace with your actual Measurement ID
- Save the file

### 4. Deploy
Run: `vercel --prod`

## What You'll Be Able to Track:
- ✅ Total visitors (excluding you if you set up filters)
- ✅ Page views
- ✅ User locations (country, city)
- ✅ Device types (mobile, desktop, tablet)
- ✅ Browser types
- ✅ Traffic sources (direct, social, search engines)
- ✅ Real-time visitors
- ✅ User engagement time

## Filtering Out Your Own Visits:
To exclude your own visits from analytics:
1. In Google Analytics, go to Admin → Data Streams
2. Click on your web stream
3. Configure tag settings → Show all
4. Define internal traffic
5. Add your IP address

## Viewing Analytics:
- Go to https://analytics.google.com/
- Select your property
- View Reports → Realtime (to see live visitors)
- View Reports → Acquisition → Traffic acquisition (to see where visitors come from)

Note: It may take 24-48 hours for data to start appearing in reports.

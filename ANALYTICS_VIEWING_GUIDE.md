# 📊 Google Analytics - Where to View Your Data

## Main Dashboard
**URL:** https://analytics.google.com/

---

## 🔴 1. REAL-TIME VISITORS (See Who's Online NOW)

**Navigation:** Reports → Realtime → Overview

**What You'll See:**
```
Users in the last 30 minutes: 5
├─ Page Views: 12
├─ Top Pages:
│  └─ / (home page): 8 views
│  └─ /about: 4 views
├─ Countries:
│  └─ India: 3 users
│  └─ United States: 2 users
└─ Devices:
   └─ Mobile: 3 users
   └─ Desktop: 2 users
```

**Use Case:** Check if people are visiting your site RIGHT NOW

---

## 📈 2. TOTAL VISITORS & ENGAGEMENT

**Navigation:** Reports → Life cycle → Engagement → Overview

**What You'll See:**
```
Last 7 days:
├─ Total Users: 1,234
├─ New Users: 1,100
├─ Sessions: 1,500
├─ Page Views: 3,200
├─ Average Engagement Time: 2m 15s
└─ Bounce Rate: 45%
```

**Use Case:** Track overall growth and user engagement

---

## 🌍 3. VISITOR LOCATIONS

**Navigation:** Reports → User → Demographics → Overview

**What You'll See:**
```
Top Countries:
1. India: 800 users (65%)
2. United States: 200 users (16%)
3. United Kingdom: 100 users (8%)
4. Canada: 50 users (4%)
5. Australia: 84 users (7%)

Top Cities:
1. Hyderabad: 250 users
2. Bangalore: 180 users
3. Chennai: 150 users
```

**Use Case:** Understand your audience geography

---

## 📱 4. DEVICE & BROWSER INFO

**Navigation:** Reports → User → Tech → Overview

**What You'll See:**
```
Device Category:
├─ Mobile: 650 users (53%)
├─ Desktop: 500 users (40%)
└─ Tablet: 84 users (7%)

Browser:
├─ Chrome: 700 users (57%)
├─ Safari: 300 users (24%)
├─ Firefox: 150 users (12%)
└─ Edge: 84 users (7%)

Operating System:
├─ Android: 500 users (40%)
├─ Windows: 400 users (32%)
├─ iOS: 250 users (20%)
└─ macOS: 84 users (8%)
```

**Use Case:** Optimize your site for the most common devices

---

## 🔍 5. TRAFFIC SOURCES (How They Found You)

**Navigation:** Reports → Life cycle → Acquisition → Traffic acquisition

**What You'll See:**
```
Session Source/Medium:
├─ Direct / (none): 500 sessions (33%)
│  └─ People who typed telugutts.com directly
├─ Google / organic: 450 sessions (30%)
│  └─ Found you through Google search
├─ twitter.com / referral: 300 sessions (20%)
│  └─ Clicked link from Twitter/X
├─ facebook.com / referral: 150 sessions (10%)
│  └─ Clicked link from Facebook
└─ Other: 100 sessions (7%)
```

**Use Case:** Understand which marketing efforts are working

---

## 📊 6. POPULAR PAGES

**Navigation:** Reports → Life cycle → Engagement → Pages and screens

**What You'll See:**
```
Top Pages:
1. / (homepage): 2,000 views
2. /about: 500 views
3. /contact: 300 views
```

**Use Case:** See which pages are most popular

---

## ⏰ 7. WHEN PEOPLE VISIT

**Navigation:** Reports → Life cycle → Engagement → Overview
(Then click on the graph to see hourly breakdown)

**What You'll See:**
```
Peak Hours (IST):
├─ 9 AM - 11 AM: High traffic
├─ 2 PM - 4 PM: Medium traffic
└─ 8 PM - 10 PM: High traffic

Peak Days:
├─ Monday: 250 users
├─ Tuesday: 220 users
├─ Wednesday: 240 users
```

**Use Case:** Know the best time to post updates or run promotions

---

## 🎯 QUICK TIPS:

### Daily Check (2 minutes):
1. Open: Reports → Realtime → Overview
   - See current visitors
2. Check: Reports → Engagement → Overview
   - Compare today vs yesterday

### Weekly Review (10 minutes):
1. Traffic Acquisition - Where are visitors coming from?
2. Demographics - Which countries/cities?
3. Tech Overview - Mobile vs Desktop usage?

### Monthly Analysis (30 minutes):
1. Compare month-over-month growth
2. Identify top-performing content
3. Analyze traffic source trends
4. Review user engagement metrics

---

## 📱 MOBILE APP:

You can also download the **Google Analytics mobile app**:
- **Android:** https://play.google.com/store/apps/details?id=com.google.android.apps.giant
- **iOS:** https://apps.apple.com/app/google-analytics/id881599038

This lets you check your stats on the go!

---

## 🚫 EXCLUDING YOUR OWN VISITS:

To avoid counting your own visits:

1. Go to: Admin → Data Streams → Web → Configure tag settings
2. Click "Show all" under "Configure tag settings"
3. Click "Define internal traffic"
4. Click "Create"
5. Add your IP address (Google "what is my IP" to find it)
6. Save

Then go to: Admin → Data Settings → Data Filters
- Change "Internal Traffic" filter from "Testing" to "Active"

---

## ⏱️ DATA FRESHNESS:

- **Realtime:** Updates every few seconds
- **Standard Reports:** Updates every 24-48 hours
- **Historical Data:** Available after 24-48 hours

**Note:** It may take 24-48 hours after setup for data to start appearing in standard reports. Realtime data appears immediately!

---

## 🆘 NEED HELP?

If you don't see data after 48 hours:
1. Check that you replaced `G-XXXXXXXXXX` with your actual Measurement ID
2. Verify the code is deployed to production (visit your live site and view source)
3. Test using Realtime view - visit your site and see if you appear in Realtime reports

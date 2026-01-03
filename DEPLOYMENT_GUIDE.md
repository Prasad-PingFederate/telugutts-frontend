# 🚀 Telugu TTS - Deployment Guide

## Current Status
✅ All files created and ready
✅ Vercel CLI installed
⏳ Waiting for you to complete authentication

---

## 📋 Step-by-Step Deployment Instructions

### Step 1: Complete Vercel Login (IN PROGRESS)
A browser window should have opened. Please:
1. **Log in** to your Vercel account (or create one if you don't have it)
2. **Authorize** the Vercel CLI
3. Come back to the terminal once you see "Success!"

### Step 2: Deploy to Vercel
Once logged in, run this command:
```bash
vercel --prod
```

You'll be asked a few questions:
- **Set up and deploy?** → Press `Y` (Yes)
- **Which scope?** → Select your account
- **Link to existing project?** → Press `N` (No, create new)
- **What's your project's name?** → Press Enter (use default: `telugu-tts`)
- **In which directory is your code located?** → Press Enter (use `./`)

### Step 3: Add RunPod API Key (IMPORTANT!)
After deployment, you need to add your RunPod API key as an environment variable:

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to https://vercel.com/dashboard
2. Click on your `telugu-tts` project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name:** `RUNPOD_API_KEY`
   - **Value:** Your RunPod API key
   - **Environment:** Production, Preview, Development (select all)
5. Click **Save**
6. Go to **Deployments** tab
7. Click the **⋯** menu on the latest deployment
8. Click **Redeploy** → **Use existing Build Cache**

**Option B: Via CLI**
```bash
vercel env add RUNPOD_API_KEY
```
Then paste your RunPod API key when prompted.

### Step 4: Test Your Application
Once deployed, Vercel will give you a URL like:
```
https://telugu-tts.vercel.app
```

Visit this URL and test:
1. Enter some Telugu text
2. Click "Generate Speech"
3. Listen to the audio
4. Download if needed

---

## 🔧 Troubleshooting

### If deployment fails:
```bash
# Check Vercel CLI version
vercel --version

# Try deploying again
vercel --prod
```

### If API doesn't work:
1. Check if `RUNPOD_API_KEY` is set in Vercel dashboard
2. Check browser console for errors (F12)
3. Check Vercel function logs in dashboard

### To redeploy after changes:
```bash
vercel --prod
```

---

## 📁 Project Structure
```
telugu_tts_fix/
├── index.html          # Frontend - Main page
├── styles.css          # Frontend - Styling
├── script.js           # Frontend - Logic
├── api/
│   └── tts.js         # Backend - API endpoint
├── vercel.json        # Vercel configuration
├── package.json       # Project metadata
└── .gitignore         # Git ignore rules
```

---

## 🌐 How It Works

```
User Browser (index.html)
    ↓ (enters Telugu text)
    ↓ (clicks Generate)
    ↓
Frontend (script.js)
    ↓ POST /api/tts
    ↓
Vercel Function (api/tts.js)
    ↓ (with RUNPOD_API_KEY)
    ↓
RunPod API
    ↓ (generates audio)
    ↓
Returns base64 audio
    ↓
Frontend plays audio
```

---

## 🎯 Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Add your custom domain

2. **Monitor Usage**
   - Check Vercel Dashboard for function invocations
   - Monitor RunPod usage and costs

3. **Share Your App**
   - Share the Vercel URL with users
   - Add it to your portfolio!

---

## 📞 Need Help?

If you encounter any issues:
1. Check Vercel function logs in the dashboard
2. Check browser console (F12) for frontend errors
3. Verify RUNPOD_API_KEY is correctly set
4. Make sure RunPod endpoint is active

---

**Created:** 2025-12-11
**Version:** 1.0.0

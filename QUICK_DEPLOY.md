# 🚀 Quick Deployment Guide - Update Your Existing Project

Since you already have `telugutts-frontend` deployed on Vercel, here's how to update it with the fixed backend:

## Option 1: Deploy via Vercel Dashboard (EASIEST) ⭐

### Step 1: Prepare Your Files
All your files are ready in this folder:
```
c:\Users\Infobell\.gemini\antigravity\scratch\telugu_tts_fix
```

### Step 2: Upload to Vercel
1. Go to https://vercel.com/prasad-dammais-projects/telugutts-frontend
2. Click **"Settings"** tab
3. Scroll down to **"Git"** section
4. If connected to Git: Push these files to your repository
5. If NOT connected to Git: Use Option 2 below

---

## Option 2: Deploy via Drag & Drop (SUPER EASY) 🎯

### Step 1: Create a ZIP file
1. Go to folder: `c:\Users\Infobell\.gemini\antigravity\scratch\telugu_tts_fix`
2. Select these files:
   - ✅ `index.html`
   - ✅ `styles.css`
   - ✅ `script.js`
   - ✅ `api` folder (with `tts.js` inside)
   - ✅ `vercel.json`
   - ✅ `package.json`
3. Right-click → "Compress to ZIP file"

### Step 2: Deploy
1. Go to https://vercel.com/new
2. Click **"Deploy"** or **"Import Project"**
3. Drag and drop your ZIP file
4. Vercel will automatically deploy!

---

## Option 3: Use Git (RECOMMENDED FOR LONG TERM) 📦

### Step 1: Initialize Git (if not already)
```bash
cd c:\Users\Infobell\.gemini\antigravity\scratch\telugu_tts_fix
git init
git add .
git commit -m "Fixed backend API for Telugu TTS"
```

### Step 2: Push to GitHub
```bash
# Create a new repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/telugu-tts.git
git branch -M main
git push -u origin main
```

### Step 3: Connect to Vercel
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your `telugu-tts` repository
4. Click **"Deploy"**

---

## ⚠️ IMPORTANT: Add RunPod API Key

After deployment, you MUST add your RunPod API key:

1. Go to https://vercel.com/prasad-dammais-projects/telugutts-frontend
2. Click **"Settings"** → **"Environment Variables"**
3. Click **"Add New"**
4. Enter:
   - **Name:** `RUNPOD_API_KEY`
   - **Value:** `[Your RunPod API Key]`
   - **Environment:** Select all (Production, Preview, Development)
5. Click **"Save"**
6. Go to **"Deployments"** tab
7. Click **"Redeploy"** on the latest deployment

---

## 🎯 Files to Upload

Make sure these files are included:

```
telugu_tts_fix/
├── index.html          ← Frontend UI
├── styles.css          ← Styling
├── script.js           ← Frontend logic
├── api/
│   └── tts.js         ← FIXED backend (this is the important one!)
├── vercel.json        ← Vercel config
└── package.json       ← Project info
```

---

## ✅ After Deployment

1. Visit your URL: https://telugutts-frontend.vercel.app (or similar)
2. Test by entering Telugu text
3. Click "Generate Speech"
4. Should work now with the fixed backend! 🎉

---

## 🔧 What We Fixed

The backend file `api/tts.js` now correctly extracts the audio data:
- **Before:** `statusData.output.audio_base64` ❌
- **After:** `statusData.output` ✅

This matches the actual RunPod response structure!

---

**Which option would you like to use?**
- Option 1: Update via dashboard
- Option 2: Drag & drop ZIP
- Option 3: Use Git

Let me know and I can help with the specific steps!

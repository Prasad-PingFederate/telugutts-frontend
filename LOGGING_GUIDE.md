# 🔍 Debugging & Logging Guide for TeluguTTS.com

## 📍 How to Check Logs When Features Fail

### **1. Browser Console Logs (Frontend)**

#### **Step-by-Step:**
1. Open your website: `https://telugutts.com/ai-translator-studio/`
2. **Right-click** anywhere → Select **"Inspect"** (or press `F12`)
3. Click the **"Console"** tab
4. Try the failing feature (e.g., click "Speak")
5. Look for messages with these prefixes:
   - `[TTS]` - Text-to-Speech logs
   - `[Translation]` - Translation logs
   - `[Preview]` - Voice preview logs
   - `[UI]` - User interface logs

#### **What to Look For:**
- ✅ `[TTS] ✅ Success` - Feature worked
- ❌ `[TTS] ❌ Error:` - Feature failed (read the error message)
- ⚠️ `[TTS] Warning:` - Non-critical issue

#### **Example Logs:**
```
[TTS] Generating: {voice: "Mohan (M)", speed: "1.0x", pitch: "0Hz"}
[TTS] Response status: 200
[TTS] Response keys: ["audio_base64", "message"]
[TTS] ✅ Success - Audio playing
```

---

### **2. Network Tab (API Requests)**

#### **Step-by-Step:**
1. Open DevTools (`F12`) → **"Network"** tab
2. Click **"Clear"** (🚫 icon) to reset
3. Try the failing feature
4. Find the failed request (usually red text):
   - `/api/voice` - Voice generation
   - `/api/translate` - Translation
5. **Click on the failed request**
6. Check these tabs:
   - **Headers** - Request details
   - **Payload** - Data you sent
   - **Response** - Error message from server
   - **Preview** - Formatted error

#### **Common Errors:**
- `500 Internal Server Error` - Backend crashed
- `429 Too Many Requests` - Rate limit hit
- `400 Bad Request` - Invalid parameters sent

---

### **3. Vercel Production Logs (Backend)**

#### **Step-by-Step:**
1. Go to: `https://vercel.com/`
2. Log in with your account
3. Select project: **`telugutts-frontend`**
4. Click **"Logs"** in the left sidebar
5. Filter by:
   - **Function**: `/api/voice` or `/api/translate`
   - **Time**: Last 1 hour
6. Look for **ERROR** entries

#### **What You'll See:**
```python
ERROR: Traceback (most recent call last):
  File "api/voice.py", line 45, in do_POST
    speed_float = float(speed)
ValueError: could not convert string to float: 'undefined'
```

#### **How to Access Logs Quickly:**
Direct URL: `https://vercel.com/prasad-dammais-projects/telugutts-frontend/logs`

---

### **4. Real-Time Monitoring (Advanced)**

#### **Enable Live Logging:**
Add this to your browser console:
```javascript
// Monitor all fetch requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
    console.log('[FETCH]', args[0], args[1]);
    return originalFetch.apply(this, arguments)
        .then(response => {
            console.log('[FETCH] Response:', response.status, response.statusText);
            return response;
        })
        .catch(error => {
            console.error('[FETCH] Error:', error);
            throw error;
        });
};
console.log('✅ Fetch monitoring enabled');
```

---

## 🛠️ **Built-in Logging Features**

### **All Frontend Actions Are Logged:**

| Action | Log Message |
|--------|-------------|
| Voice selected | `[Voice] Selected: Mohan (M) te-IN-MohanNeural` |
| Translation started | `[Translation] Starting: {source: 'en', target: 'te'}` |
| TTS request | `[TTS] Generating: {voice, speed, pitch, style}` |
| Preview clicked | `[Preview] Playing: te-IN-MohanNeural` |
| Copy/Paste | `[UI] Copied to clipboard` |
| Clear | `[UI] Cleared all inputs` |

### **Error Logging:**
Every API call logs:
- ✅ Success with details
- ❌ Failure with exact error message
- ⚠️ Warnings for missing parameters

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Voice generation failed"**

**Check:**
1. Console: `[TTS] Response keys:`
2. If no `audio_base64` → Backend error
3. Vercel logs → Find Python error

**Fix:**
- Speed/pitch values might be invalid
- Voice ID might be wrong
- Text might be empty

---

### **Issue 2: "Server Communication Error"**

**Check:**
1. Network tab → Status code
2. If 500 → Backend crash (check Vercel logs)
3. If timeout → API taking too long

**Fix:**
- Reduce text length
- Try different voice
- Check Vercel function timeout (60s max)

---

###  **Issue 3: Advanced Controls Not Working**

**Check:**
1. Console: `[TTS] Generating:` - verify speed/pitch values
2. Network → Payload tab
3. Look for `speed`, `pitch`, `style` in request

**Fix:**
- Ensure elements exist: `document.getElementById('voice-speed')`
- Check for typos in IDs
- Verify CSS loaded (voice-controls.css)

---

## 📊 **Log Interpretation Guide**

### **Successful TTS Flow:**
```
[Voice] Selected: Andrew (Premium M) en-US-AndrewMultilingualNeural
[TTS] Generating: {voice: "Andrew (Premium M)", speed: "1.2x", pitch: "+5Hz"}
[TTS] Response status: 200
[TTS] Response keys: ["audio_base64", "message"]
[TTS] ✅ Success - Audio playing
```

### **Failed TTS Flow:**
```
[TTS] Generating: {voice: "Mohan (M)", speed: "undefined"}
[TTS] Response status: 500
[TTS] ❌ Error: Error: HTTP 500: Internal Server Error
Voice Service Error: HTTP 500: Internal Server Error
```
**Diagnosis:** Speed parameter is undefined → Frontend bug

---

## 🔧 **How to Export Logs for Support**

### **Method 1: Browser Console**
1. Right-click in Console → **"Save as..."**
2. Save as `console-logs.txt`

### **Method 2: Copy All Logs**
```javascript
// Run in console to copy all logs
copy(console.log.toString());
```

### **Method 3: Screenshot**
- `F12` → Console tab → `Ctrl + Shift + P` → "Capture screenshot"

---

## 🎯 **Quick Diagnostic Checklist**

Before reporting an issue:
- [ ] Checked Browser Console for errors
- [ ] Checked Network tab for failed requests
- [ ] Checked Vercel logs (if 500 error)
- [ ] Tried in incognito mode (clear cache)
- [ ] Tested different voice/language
- [ ] Noted exact error message

---

## 📞 **Where to Find Help**

1. **Browser Console** - Instant feedback
2. **Network Tab** - API request/response
3. **Vercel Dashboard** - Backend errors
4. **This Guide** - Common solutions

---

**Last Updated:** January 2, 2026
**Version:** 2.0 (Advanced Controls Update)

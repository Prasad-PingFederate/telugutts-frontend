# 🚀 How to Manually Deploy to telugutts.com

Follow these steps to deploy your latest code to your live website manually.

## 1️⃣ Open Terminal
1.  Navigate to your project folder: `c:\Users\Infobell\.gemini\antigravity\scratch\telugu_tts_fix\`
2.  Right-click in the folder and select **"Open in Terminal"** (or use VS Code terminal).

## 2️⃣ Connect to Vercel (If not connected)
If you are moving to a new computer or resetting, you first need to link the folder to your Vercel project.
*(You only need to do this once per computer)*.

Type this command and press Enter:
```powershell
vercel link
```

*   **Log in:** It might ask you to log in via browser.
*   **Scope:** Select your account (`Prasad Dammai's projects`).
*   **Link to existing project?** Type `Y` (Yes).
*   **Name:** Type `telugutts-frontend`.

## 3️⃣ Deploy to Production (The Main Step)
To push your changes to `telugutts.com`, run this command:

```powershell
vercel --prod
```

*   It will upload your files.
*   It will show you a "Production" URL (e.g., `https://telugutts-frontend...`).
*   **Done!** Your live site is updated immediately.

---

## 💡 Common Commands Cheat Sheet

| Command | What it does |
| :--- | :--- |
| `vercel` | Deploys a **Preview** version (for testing only, doesn't change the main site). |
| `vercel --prod` | Deploys to **Production** (updates telugutts.com). |
| `vercel env pull` | Downloads your Environment Variables (like RUNPOD_API_KEY) to your local machine for testing. |

# 🚀 Final Deployment Steps

You are almost there! We have fixed the `vercel.json` and the API code. Now you need to manually finish the deployment to connect everything.

## Step 1: Deploy to Vercel
Since the manual login from my side isn't possible, please run this command in your terminal:

```bash
vercel --prod
```

1.  If it asks to log in, follow the browser steps.
2.  Select the project scope (your account).
3.  Link to existing project? **No**.
4.  Project Name: `telugu-tts` (or whatever you prefer).
5.  In which directory is your code located? `./` (Just press Enter).
6.  It will build and give you a Production URL (e.g., `https://telugu-tts-xyz.vercel.app`).

## Step 2: Add API Key (CRITICAL)
Your app **will not work** without the RunPod API Key.

1.  Go to your **Vercel Dashboard** (https://vercel.com/dashboard).
2.  Click on your new **`telugu-tts`** project.
3.  Go to **Settings** > **Environment Variables**.
4.  Add a new variable:
    *   **Key**: `RUNPOD_API_KEY`
    *   **Value**: `<YOUR_RUNPOD_API_KEY>` (Paste your actual key here usually starts with `rpa_...`)
5.  Click **Save**.
6.  **Redeploy** for the changes to take effect:
    *   Go to **Deployments** tab.
    *   Click the three dots (`...`) on the latest deployment -> **Redeploy**.

## Step 3: Fix DNS (Domain Name)
To fix the "mistake" of using both GitHub and Vercel:

1.  Log in to your Domain Provider (GoDaddy, Namecheap, etc.).
2.  **Delete** any A/CNAME records pointing to `github.io`.
3.  Ensure you have the Vercel records:
    *   **A Record**: `@` points to `76.76.21.21`
    *   **CNAME Record**: `www` points to `cname.vercel-dns.com`
4.  In Vercel Dashboard -> **Settings** -> **Domains**, add `telugutts.com`.

Once verified, your site will be live and fully functional!

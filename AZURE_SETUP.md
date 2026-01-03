# ☁️ Azure TSS Setup Guide

Since you are switching to Microsoft Azure, you need to add your Azure credentials to Vercel.

## 1. Get your Keys
1. Log in to [Azure Portal](https://portal.azure.com/).
2. Go to your **Speech Service** resource (or Cognitive Services).
3. Look for **"Keys and Endpoint"** in the left menu.
4. Copy:
   - **Key 1** (This is your API Key)
   - **Location/Region** (e.g., `eastus`, `centralindia`, `southeastasia`)

## 2. Add to Vercel
1. Go to your Vercel Dashboard.
2. Open the `telugu-tts` project.
3. Go to **Settings** -> **Environment Variables**.
4. Add these two variables:

| Key | Value Example |
|-----|---------------|
| `AZURE_SPEECH_KEY` | `394857384...` (Your long key) |
| `AZURE_SPEECH_REGION` | `eastus` (Your region code) |

## 3. Redeploy (Important!)
After adding the keys:
1. Go to the **Deployments** tab.
2. Click the **three dots (...)** -> **Redeploy**.

Once redeployed, refresh `telugutts.com`. You will see "Mohan" and "Shruti" options!

# 🔄 How to Restore Your Telugu TTS Project

If you ever lose your laptop or need to move this project to a new computer, follow these simple steps.

## 📦 Prerequisites

1.  **Install Node.js**: Download and install from [nodejs.org](https://nodejs.org/).
2.  **Install Vercel CLI**: Open your terminal (Command Prompt or PowerShell) and run:
    ```bash
    npm install -g vercel
    ```

## 🚀 Restoration Steps

1.  **Unzip the Files**: Extract your backup zip file into a new folder (e.g., `my-telugu-tts`).
2.  **Open Terminal**: Right-click inside that folder and select "Open key Terminal here" (or navigate to it `cd path/to/folder`).
3.  **Login to Vercel**:
    ```bash
    vercel login
    ```
4.  **Deploy**:
    ```bash
    vercel --prod
    ```
    *   Follow the prompts. 
    *   When asked "Link to existing project?", say **Yes**.
    *   Enter the project name: `telugutts-frontend`.

5.  **Verify Environment Variables**:
    *   Go to your Vercel Dashboard websites.
    *   Check `telugutts-frontend` -> Settings -> Environment Variables.
    *   Ensure `RUNPOD_API_KEY` is still there. If not, add it again.

## 📂 File Structure Explained

*   **`index.html`**: The main website page.
*   **`styles.css`**: All the design, colors, and animations.
*   **`script.js`**: The logic that captures text and plays audio.
*   **`api/tts.js`**: The backend code that talks to RunPod securely.
*   **`vercel.json`**: Configuration file that tells Vercel how to run the app.
*   **`ARCHITECTURE_AND_FLOW.md`**: Explanation of how the system works.

---
**Keep your `RUNPOD_API_KEY` safe! It is NOT included in the code files for security.**

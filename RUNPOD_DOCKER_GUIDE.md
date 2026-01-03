# How to Deploy Your Custom AI Model to RunPod Serverless

You currently have a "Serverless Endpoint" on RunPod, but it's likely running default code. To make it run your **new Ultimate Telugu Voice (IndicF5)** code, you need to replace the software (Docker Image) it runs.

Here is the 3-step guide to doing that.

---

### Step 1: Build the Docker Image
**Concept:** A "Docker Image" is like a frozen snapshot of a computer. It contains the OS (Linux), the libraries (Python, PyTorch), and your code (`app.py`).

**How to do it:**
1.  **Install Docker Desktop** on your computer if you don't have it.
2.  Open your terminal in the folder where we unzipped the files (`runpod_ultimate_voice`).
3.  Run this command:
    ```bash
    docker build -t prasad/telugu-ultimate-voice:v1 .
    ```
    *(Note the `.` at the end! It tells Docker to look effectively "here" for the Dockerfile)*

### Step 2: Push to Docker Hub
**Concept:** RunPod cannot see the files on your laptop. You need to upload your "Image" to a public library called **Docker Hub** (like GitHub but for servers).

**How to do it:**
1.  Create a free account on [hub.docker.com](https://hub.docker.com/).
2.  Login in your terminal: `docker login` (enter your username/password).
3.  Run this command to upload:
    ```bash
    docker push prasad/telugu-ultimate-voice:v1
    ```
    *(Replacing `prasad` with your actual Docker Hub username)*

### Step 3: Update RunPod Endpoint
**Concept:** Now you tell RunPod: "Hey, stop using the old code. Download and use `v1` of my new Ultimate Voice image."

**How to do it:**
1.  Go to your **RunPod Dashboard** -> **Serverless**.
2.  Click on your endpoint (`tts-serverless-backend`).
3.  Click **Edit** (or Settings).
4.  Find the field **"Container Image"**.
5.  Change it to: `prasad/telugu-ultimate-voice:v1` (your username/image name).
6.  Click **Update**.

**Result:**
RunPod will kill the old workers. The next time you click "Generate" on your website, RunPod will:
1.  Wake up a new customized AI server.
2.  Load the huge IndicF5 model (Start-up cold start might take 60-120s the first time).
3.  From then on, it generates "Ultimate" quality audio efficiently!

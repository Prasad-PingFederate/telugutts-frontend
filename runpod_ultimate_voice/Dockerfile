
FROM pytorch/pytorch:2.1.2-cuda12.1-cudnn8-runtime

WORKDIR /app

# Install system dependencies for audio
RUN apt-get update && apt-get install -y \
    git \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt runpod

# Install IndicF5 directly from GitHub
RUN pip install git+https://github.com/ai4bharat/IndicF5.git

# Copy application code
COPY . .

# Create directory for default voices
RUN mkdir -p voices

# Expose port
EXPOSE 8000

# Start command for Serverless
CMD ["python", "-u", "handler.py"]

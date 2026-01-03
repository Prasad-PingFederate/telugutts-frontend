"""
Test script to verify RunPod endpoint is working correctly
Run this to test your backend before deploying to Vercel
"""

import requests
import json
import time

# CONFIGURATION - Update these values
RUNPOD_ENDPOINT_ID = "76h1nrfetqywu1"  # Your endpoint ID from RunPod
RUNPOD_API_KEY = "YOUR_API_KEY_HERE"  # Get this from RunPod settings

# RunPod API URLs
RUN_URL = f"https://api.runpod.ai/v2/{RUNPOD_ENDPOINT_ID}/run"
STATUS_URL = f"https://api.runpod.ai/v2/{RUNPOD_ENDPOINT_ID}/status"

def test_runpod_endpoint():
    """Test the RunPod serverless endpoint"""
    
    print("🧪 Testing RunPod Endpoint...")
    print(f"Endpoint ID: {RUNPOD_ENDPOINT_ID}")
    print("-" * 50)
    
    # Test text
    test_text = "హలో, ఇది తెలుగు టెక్స్ట్ టు స్పీచ్ టెస్ట్"
    
    # Step 1: Submit job
    print("\n1️⃣ Submitting job to RunPod...")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {RUNPOD_API_KEY}"
    }
    
    payload = {
        "input": {
            "text": test_text
        }
    }
    
    try:
        response = requests.post(RUN_URL, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Error: {response.text}")
            return False
            
        job_data = response.json()
        print(f"✅ Job submitted successfully!")
        print(f"Job ID: {job_data.get('id')}")
        
        job_id = job_data.get('id')
        if not job_id:
            print("❌ No job ID received")
            return False
            
    except Exception as e:
        print(f"❌ Error submitting job: {e}")
        return False
    
    # Step 2: Poll for results
    print("\n2️⃣ Polling for results...")
    max_attempts = 30
    attempt = 0
    
    while attempt < max_attempts:
        time.sleep(1)
        attempt += 1
        
        try:
            status_response = requests.get(
                f"{STATUS_URL}/{job_id}",
                headers=headers
            )
            
            if status_response.status_code != 200:
                print(f"❌ Status check failed: {status_response.text}")
                continue
                
            status_data = status_response.json()
            status = status_data.get('status')
            
            print(f"Attempt {attempt}/{max_attempts}: Status = {status}")
            
            if status == 'COMPLETED':
                print("\n✅ Job completed successfully!")
                output = status_data.get('output', {})
                
                if 'audio_base64' in output:
                    audio_length = len(output['audio_base64'])
                    print(f"📊 Audio base64 length: {audio_length} characters")
                    print(f"📊 Estimated audio size: ~{audio_length * 3 / 4 / 1024:.2f} KB")
                    print(f"✅ Message: {output.get('message', 'N/A')}")
                    
                    # Save audio to file for testing
                    import base64
                    audio_bytes = base64.b64decode(output['audio_base64'])
                    with open('test_output.mp3', 'wb') as f:
                        f.write(audio_bytes)
                    print("💾 Audio saved to test_output.mp3")
                    
                    return True
                else:
                    print("❌ No audio_base64 in output")
                    print(f"Output: {output}")
                    return False
                    
            elif status == 'FAILED':
                print(f"\n❌ Job failed!")
                print(f"Error: {status_data.get('error')}")
                return False
                
        except Exception as e:
            print(f"❌ Error checking status: {e}")
            continue
    
    print("\n⏰ Timeout: Job took too long")
    return False

def test_endpoint_health():
    """Quick health check of the endpoint"""
    print("\n🏥 Checking endpoint health...")
    
    try:
        # Try to get endpoint info
        health_url = f"https://api.runpod.ai/v2/{RUNPOD_ENDPOINT_ID}/health"
        headers = {"Authorization": f"Bearer {RUNPOD_API_KEY}"}
        
        response = requests.get(health_url, headers=headers)
        print(f"Health check status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Endpoint is healthy")
            return True
        else:
            print(f"⚠️ Endpoint health check returned: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"⚠️ Could not check health: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("RunPod Endpoint Test Script")
    print("=" * 50)
    
    # Check if API key is set
    if RUNPOD_API_KEY == "YOUR_API_KEY_HERE":
        print("\n❌ ERROR: Please set your RUNPOD_API_KEY in this script")
        print("Get your API key from: https://www.runpod.io/console/user/settings")
        exit(1)
    
    # Run tests
    # test_endpoint_health()  # Optional health check
    success = test_runpod_endpoint()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ ALL TESTS PASSED!")
        print("Your RunPod endpoint is working correctly.")
        print("You can now deploy the Vercel API route.")
    else:
        print("❌ TESTS FAILED!")
        print("Please check your RunPod configuration.")
    print("=" * 50)

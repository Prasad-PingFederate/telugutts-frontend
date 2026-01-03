from http.server import BaseHTTPRequestHandler
import json
import asyncio
import edge_tts
import base64
import os
import tempfile
import re

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            body = json.loads(post_data.decode('utf-8'))
            text = body.get('text', '').strip()
            voice_code = body.get('voice', 'te-IN-MohanNeural')
            speed = body.get('speed', '1.0')  # Speed multiplier
            pitch = body.get('pitch', '0')    # Pitch adjustment in Hz
            style = body.get('style', 'general')  # Speaking style
            
            if not text:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'No text provided'}).encode('utf-8'))
                return

            # Calculate rate adjustment based on speed
            # Convert 1.0 = default to Azure rate format
            try:
                speed_float = float(speed)
            except ValueError:
                speed_float = 1.0

            if speed_float < 1.0:
                rate_str = f"-{int((1.0 - speed_float) * 50)}%"
            elif speed_float > 1.0:
                rate_str = f"+{int((speed_float - 1.0) * 50)}%"
            else:
                rate_str = "+0%"

            # Improve naturalness
            processed_text = self.improve_text_naturalness(text)
            
            # Ensure rate and pitch are compliant
            pitch_val = str(pitch).replace('Hz', '').strip()
            if pitch_val == '0' or pitch_val == '':
                pitch_str = '+0Hz'
            elif not pitch_val.startswith('+') and not pitch_val.startswith('-'):
                pitch_str = f'+{pitch_val}Hz'
            else:
                pitch_str = f'{pitch_val}Hz'

            async def generate_audio():
                communicate = edge_tts.Communicate(
                    processed_text, 
                    voice_code,
                    rate=rate_str,
                    pitch=pitch_str
                )
                
                with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
                    tmp_path = tmp_file.name
                    
                await communicate.save(tmp_path)
                return tmp_path

            # FIX: Handle asyncio event loop for serverless environment
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)

            if loop.is_running():
                # If loop is running, we might be in a complex env; 
                # but standard do_POST is sync. 
                # If we are here, we might need run_until_complete or similar risks.
                # Safer to just use run_until_complete if we own the loop
                tmp_path = loop.run_until_complete(generate_audio())
            else:
                tmp_path = loop.run_until_complete(generate_audio())

            with open(tmp_path, "rb") as audio_file:
                audio_bytes = audio_file.read()
                base64_audio = base64.b64encode(audio_bytes).decode('utf-8')

            os.remove(tmp_path)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'audio_base64': base64_audio,
                'message': f'Voice {voice_code} generated successfully with custom settings  (speed: {speed}x, pitch: {pitch}Hz)'
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_response = {'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def improve_text_naturalness(self, text):
        text = re.sub(r'([.!?।])([^\s])', r'\1 \2', text)
        text = re.sub(r',([^\s])', r', \1', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

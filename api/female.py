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
            
            if not text:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'No text provided'}).encode('utf-8'))
                return

            # VOICE: Telugu Female (Shruti)
            VOICE = "te-IN-ShrutiNeural"
            
            # Improve naturalness by preprocessing text (spacing only, no SSML tags)
            processed_text = self.improve_text_naturalness(text)
            
            # Generate Audio with native Edge TTS parameters
            async def generate_audio():
                # Use Edge TTS with rate and pitch 
                communicate = edge_tts.Communicate(
                    processed_text, 
                    VOICE,
                    rate='-5%',  # Slightly slower for clarity
                    pitch='+0Hz'  # Normal pitch
                )
                
                # Create a temporary file
                with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
                    tmp_path = tmp_file.name
                    
                await communicate.save(tmp_path)
                return tmp_path

            # Run Async loop
            tmp_path = asyncio.run(generate_audio())

            # Read file and convert to Base64
            with open(tmp_path, "rb") as audio_file:
                audio_bytes = audio_file.read()
                base64_audio = base64.b64encode(audio_bytes).decode('utf-8')

            # Clean up
            os.remove(tmp_path)

            # Send Success Response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'audio_base64': base64_audio,
                'message': 'Female voice generated with Edge TTS'
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_response = {'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def improve_text_naturalness(self, text):
        """
        Improve text spacing for better natural pauses
        """
        # Ensure proper spacing after punctuation
        text = re.sub(r'([.!?।])([^\s])', r'\1 \2', text)
        
        # Ensure spacing after commas
        text = re.sub(r',([^\s])', r', \1', text)
        
        # Normalize multiple spaces
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()

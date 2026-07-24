import http.server
import json
import random
import time

class MockLLMHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            req_json = json.loads(post_data.decode('utf-8'))
            messages = req_json.get("messages", [])
            last_message = messages[-1]["content"] if messages else ""
            
            # Simulate some "AI" thinking
            time.sleep(0.5)
            
            responses = [
                f"Hmm, you said '{last_message}'. That's very interesting!",
                f"As an AI, I completely agree with '{last_message}'.",
                f"I processed your message: '{last_message}'. How can I help further?",
                f"That's a profound thought: '{last_message}'."
            ]
            reply = random.choice(responses)
            
            response_json = {
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "content": reply
                        }
                    }
                ]
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_json).encode('utf-8'))
        except Exception as e:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'{"error": "Invalid JSON"}')

    def log_message(self, format, *args):
        pass # Suppress logging for cleaner output

if __name__ == '__main__':
    server_address = ('', 11434)
    httpd = http.server.HTTPServer(server_address, MockLLMHandler)
    print("Mock LLM Server running on port 11434 (OpenAI-compatible /chat/completions format)")
    httpd.serve_forever()

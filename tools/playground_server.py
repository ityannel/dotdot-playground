import http.server
import socketserver
import json
import urllib.parse
import sys
import io
import traceback
import os
from lexer import Lexer, LexerError
from parser import Parser, ParseError
from evaluator import Evaluator, PopPopError, Environment

PORT = 3000

class PlaygroundHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Serve index.html or other static files in the current directory
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()

    def do_POST(self):
        if self.path == '/execute':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                req_json = json.loads(post_data.decode('utf-8'))
                code = req_json.get('code', '')
                
                # Capture output
                old_stdout = sys.stdout
                redirected_output = sys.stdout = io.StringIO()
                
                result = None
                error = None
                
                try:
                    lexer = Lexer(code)
                    tokens = lexer.tokenize()
                    parser = Parser(tokens)
                    ast = parser.parse()
                    
                    evaluator = Evaluator()
                    result = evaluator.eval(ast, evaluator.global_env)
                except (LexerError, ParseError, PopPopError) as e:
                    error = str(e)
                except Exception as e:
                    error = f"[SystemError] {e}\n{traceback.format_exc()}"
                finally:
                    sys.stdout = old_stdout
                
                output = redirected_output.getvalue()
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                
                resp = {
                    "output": output,
                    "error": error,
                    "result": str(result) if result is not None else None
                }
                self.wfile.write(json.dumps(resp).encode('utf-8'))
                
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self.send_error(404)

if __name__ == '__main__':
    # Make sure we're serving from the root directory so web/index.html and src/ can be accessed
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    with socketserver.TCPServer(("", PORT), PlaygroundHandler) as httpd:
        print(f"Playground running on http://localhost:{PORT}")
        print(f"Open http://localhost:{PORT}/web/index.html in your browser")
        httpd.serve_forever()

"""Small static Playground server with a Gemini proxy.

Set GEMINI_API_KEY before starting this server. The key stays on the server and
is never sent to the browser.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash-lite")


class PlaygroundHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_POST(self) -> None:
        if self.path != "/api/gemini":
            self.send_error(404)
            return

        api_key = os.environ.get("GEMINI_API_KEY", "").strip()
        if not api_key:
            self._send_json(503, {"error": "GEMINI_API_KEY is not set"})
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            request = json.loads(self.rfile.read(length).decode("utf-8"))
            prompt = str(request.get("prompt", "")).strip()
            json_mode = bool(request.get("json"))
            if not prompt:
                self._send_json(400, {"error": "prompt is required"})
                return
            if len(prompt) > 16000:
                self._send_json(413, {"error": "prompt is too long"})
                return

            payload: dict[str, object] = {
                "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                "generationConfig": {"maxOutputTokens": 1200},
            }
            if json_mode:
                payload["generationConfig"]["responseMimeType"] = "application/json"

            url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
            gemini_request = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": api_key,
                },
                method="POST",
            )
            with urllib.request.urlopen(gemini_request, timeout=30) as response:
                gemini_payload = json.loads(response.read().decode("utf-8"))

            parts = (
                gemini_payload.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [])
            )
            text = "".join(str(part.get("text", "")) for part in parts).strip()
            self._send_json(200, {"text": text})
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            self._send_json(exc.code, {"error": detail})
        except Exception as exc:
            self._send_json(500, {"error": str(exc)})

    def _send_json(self, status: int, payload: dict[str, object]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    port = int(os.environ.get("PORT", "8765"))
    server = ThreadingHTTPServer(("127.0.0.1", port), PlaygroundHandler)
    print(f"PopPop Playground: http://127.0.0.1:{port}")
    if not os.environ.get("GEMINI_API_KEY"):
        print("GEMINI_API_KEY is not set. Gemini tutor replies will use fallbacks.")
    server.serve_forever()


if __name__ == "__main__":
    main()

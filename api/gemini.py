from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler


MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")


class handler(BaseHTTPRequestHandler):
    def do_POST(self) -> None:
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

            payload: dict[str, object] = {
                "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            }
            if json_mode:
                payload["generationConfig"] = {"responseMimeType": "application/json"}

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

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _send_json(self, status: int, payload: dict[str, object]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

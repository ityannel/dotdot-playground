const CHAT_MODEL =
  process.env.GEMINI_CHAT_MODEL ||
  process.env.GEMINI_MODEL ||
  "gemini-3.5-flash-lite";
const LESSON_MODEL =
  process.env.GEMINI_LESSON_MODEL ||
  "gemini-3.6-flash";

function sendJson(response, status, payload) {
  response.status(status).json(payload);
}

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.setHeader("Allow", "POST, OPTIONS");
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "POST is required" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    sendJson(response, 503, { error: "GEMINI_API_KEY is not set" });
    return;
  }

  const prompt = String(request.body?.prompt || "").trim();
  const task = request.body?.task === "lesson" ? "lesson" : "chat";
  const model = task === "lesson" ? LESSON_MODEL : CHAT_MODEL;
  if (!prompt) {
    sendJson(response, 400, { error: "prompt is required" });
    return;
  }
  if (prompt.length > 16000) {
    sendJson(response, 413, { error: "prompt is too long" });
    return;
  }

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 1200 },
  };
  if (request.body?.json) {
    payload.generationConfig.responseMimeType = "application/json";
  }

  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    },
  );

  const geminiPayload = await geminiResponse.json().catch(() => ({}));
  if (!geminiResponse.ok) {
    const retryAfter = geminiResponse.headers.get("retry-after");
    if (retryAfter) response.setHeader("Retry-After", retryAfter);
    sendJson(response, geminiResponse.status, {
      error: geminiPayload.error?.message || "Gemini API request failed",
    });
    return;
  }

  const text = (geminiPayload.candidates?.[0]?.content?.parts || [])
    .map((part) => part.text || "")
    .join("")
    .trim();
  sendJson(response, 200, { text });
}

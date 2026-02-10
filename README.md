# Chitkara BFHL API

Simple Node.js (Express) implementation for the assignment.

Run locally

1. Install dependencies

```bash
npm install
cp .env.example .env
# edit .env to set CHITKARA_EMAIL
# optionally set GEMINIAI_API_KEY and GEMINI_API_URL to enable AI
```

2. Start server

```bash
npm start
```

Tests

```bash
npm test
```

AI provider

- To enable AI responses, set `GEMINIAI_API_KEY` and `GEMINI_API_URL` in your `.env` file. The server will POST a prompt to the configured URL and expect JSON in return. The implementation attempts to parse common response shapes (OpenAI-style `choices`, Google-style `output`) and returns the first token as the answer.

Notes

- The JS implementation follows the required response structure and will return 503 for AI requests when Gemini is not configured.
- Responses follow the required structure: {"is_success": true, "official_email": "YOUR CHITKARA EMAIL", "data": ...}

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { Fibonacci, Prime, LCM, HCF } = require('./lib/operations');
const app = express();
const fetch = global.fetch || require('node-fetch');

const CHITKARA_EMAIL = process.env.CHITKARA_EMAIL || 'student@chitkara.edu.in';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(express.json({ limit: '100kb' }));
app.use(helmet());
app.use(cors());

app.set('trust proxy', 1);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

function jsonSuccess(data) {
  const payload = { is_success: true, official_email: CHITKARA_EMAIL };
  if (data !== undefined) payload.data = data;
  return payload;
}

function jsonError(res, status, message) {
  return res.status(status).json({ is_success: false, error: message });
}

app.get('/health', (req, res) => {
  res.json(jsonSuccess());
});

app.post('/bfhl', async (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return jsonError(res, 400, 'JSON object required');
  }

  const keys = Object.keys(req.body);
  const allowed = new Set(['fibonacci', 'prime', 'lcm', 'hcf', 'AI']);

  if (keys.length !== 1) {
    return jsonError(res, 400, 'Exactly one key must be provided');
  }

  const key = keys[0];
  if (!allowed.has(key)) {
    return jsonError(res, 400, `Unsupported key: ${key}`);
  }

  try {
    if (key === 'fibonacci') {
      const n = req.body.fibonacci;
      if (!Number.isInteger(n) || n < 0) {
        return jsonError(res, 400, 'fibonacci must be a non-negative integer');
      }
      return res.json(jsonSuccess(Fibonacci.compute(n)));
    }

    if (key === 'prime') {
      const arr = req.body.prime;
      if (!Array.isArray(arr) || !arr.every(Number.isInteger)) {
        return jsonError(res, 400, 'prime must be an array of integers');
      }
      return res.json(jsonSuccess(Prime.compute(arr)));
    }

    if (key === 'lcm') {
      return res.json(jsonSuccess(LCM.compute(req.body.lcm)));
    }

    if (key === 'hcf') {
      return res.json(jsonSuccess(HCF.compute(req.body.hcf)));
    }

 if (key === 'AI') {

  if (!GEMINI_API_KEY) {
    return jsonError(res, 503, 'AI service not configured');
  }

  const question = req.body.AI;

  if (typeof question !== 'string' || question.trim() === '') {
    return jsonError(res, 400, 'AI must be a non-empty string');
  }

  try {

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `Reply with ONLY ONE WORD.\nQuestion: ${question}` }
              ]
            }
          ]
        })
      }
    );

    if (!resp.ok) {
      const err = await resp.text();
      console.error("Gemini error:", err);
      return jsonError(res, 502, "AI provider failure");
    }

    const data = await resp.json();

    let answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    answer = answer.trim().split(/\s+/)[0];

    return res.status(200).json(jsonSuccess(answer));

      } catch (err) {
        console.error(err);
        return jsonError(res, 502, "AI fetch failed");
      }
    }
  } catch (err) {
    console.error('Internal handler error:', err);
    return jsonError(res, 500, `Internal server error: ${err.message || String(err)}`);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

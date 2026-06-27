const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { processHierarchyRequest } = require('./processor');

dotenv.config({ path: path.join(__dirname, '..', '.env') });    

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '64kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const identity = {
  userId: process.env.USER_ID || process.env.USER_IDENTITY || process.env.USER_NAME || '',
  emailId: process.env.COLLEGE_EMAIL || process.env.EMAIL_ID || '',
  collegeRollNumber: process.env.COLLEGE_ROLL_NUMBER || process.env.ROLL_NUMBER || '',
};

app.get('/healthz', (_req, res) => {
  res.json({ ok: true });
});

app.post('/bfh1', (req, res) => {
  try {
    const payload = req.body || {};
    const result = processHierarchyRequest(payload.data, identity);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: error.message || 'Invalid request payload.',
    });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

if (process.argv.includes('--validate-only')) {
  process.exit(0);
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
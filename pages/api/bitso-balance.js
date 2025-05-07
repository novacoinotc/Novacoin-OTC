// pages/api/bitso-balance.js
import crypto from 'crypto';

export default async function handler(req, res) {
  const API_KEY    = process.env.BITSO_API_KEY;
  const API_SECRET = process.env.BITSO_API_SECRET;
  const nonce      = Math.floor(Date.now() / 1000).toString();
  const method     = 'GET';
  const path       = '/v3/balance';  // ← sin slash final

  const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(nonce + method + path)
    .digest('hex');

  try {
    const response = await fetch(`https://api.bitso.com${path}`, {
      method,
      headers: {
        'Authorization': `Bitso ${API_KEY}:${signature}`,
        'Bitso-Nonce':   nonce,
        'Content-Type':  'application/json'
      }
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      return res.status(500).json({ error: data.error?.message || 'Bitso error' });
    }
    return res.status(200).json(data.payload);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
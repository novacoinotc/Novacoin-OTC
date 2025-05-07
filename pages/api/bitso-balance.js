// pages/api/bitso-balance.js
import crypto from 'crypto';

export default async function handler(req, res) {
  const API_KEY    = process.env.BITSO_API_KEY;
  const API_SECRET = process.env.BITSO_API_SECRET;
  if (!API_KEY || !API_SECRET) {
    return res.status(500).json({ error: 'Claves de Bitso no definidas en entorno' });
  }

  // Nonce y firma HMAC
  const nonce  = Math.floor(Date.now() / 1000).toString();
  const method = 'GET';
  const path   = '/v3/balance';    // ← sin slash final
  const payloadToSign = nonce + method + path;
  const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(payloadToSign)
    .digest('hex');

  try {
    const bitsoRes = await fetch(`https://api.bitso.com${path}`, {
      method,
      headers: {
        'Authorization': `Bitso ${API_KEY}:${signature}`,
        'Bitso-Nonce':   nonce,
        'Content-Type':  'application/json'
      }
    });
    const data = await bitsoRes.json();

    if (!bitsoRes.ok || !data.success) {
      const msg = data.error?.message || JSON.stringify(data);
      return res.status(500).json({ error: 'Bitso API: ' + msg });
    }

    // Devolvemos solo el payload
    return res.status(200).json(data.payload);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
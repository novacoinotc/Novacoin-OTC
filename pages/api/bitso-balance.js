// pages/api/bitso-balance.js
import CryptoJS from 'crypto-js';

export default async function handler(req, res) {
  const API_KEY    = process.env.BITSO_API_KEY;
  const API_SECRET = process.env.BITSO_API_SECRET;

  if (!API_KEY || !API_SECRET) {
    return res.status(500).json({ error: 'Faltan credenciales de Bitso' });
  }

  const nonce  = Math.floor(Date.now() / 1000).toString();
  const method = 'GET';
  const path   = '/v3/balance/';
  // Firma HMAC SHA256 sobre nonce + método + ruta
  const signature = CryptoJS
    .HmacSHA256(nonce + method + path, API_SECRET)
    .toString();

  try {
    const r = await fetch(`https://api.bitso.com${path}`, {
      method,
      headers: {
        'Authorization': `Bitso ${API_KEY}:${signature}`,
        'Bitso-Nonce':   nonce,
        'Content-Type':  'application/json'
      }
    });
    const data = await r.json();
    if (!data.success) {
      return res.status(502).json({ error: data.error?.message || 'Error de Bitso' });
    }
    return res.status(200).json(data.payload);
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Error interno' });
  }
}

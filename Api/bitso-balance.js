// Archivo: pages/api/bitso-balance.js
import crypto from 'crypto';

export default async function handler(req, res) {
  const API_KEY = process.env.BITSO_API_KEY;
  const API_SECRET = process.env.BITSO_API_SECRET;

  const nonce = Date.now().toString();
  const method = 'GET';
  const requestPath = '/v3/balance/';
  const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(nonce + method + requestPath)
    .digest('hex');

  const headers = {
    Authorization: `Bitso ${API_KEY}:${nonce}:${signature}`,
  };

  try {
    const response = await fetch(`https://api.bitso.com${requestPath}`, {
      method,
      headers,
    });

    const data = await response.json();

    if (data.success) {
      res.status(200).json(data.payload);
    } else {
      res.status(500).json({ error: 'Error al obtener el saldo', ...data });
    }
  } catch (error) {
    console.error('Error API:', error);
    res.status(500).json({ error: 'Fallo al conectar con Bitso' });
  }
}

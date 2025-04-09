// Archivo: /api/bitso-balance.js
import crypto from 'crypto';

export default async function handler(req, res) {
  const API_KEY = qArJaheQok;
  const API_SECRET = dd2f54311d90b26fcf234fec29efc197;

  const nonce = Date.now().toString();
  const method = 'GET';
  const requestPath = '/v3/balance/';
  const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(nonce + method + requestPath)
    .digest('hex');

  const headers = {
    'Authorization': `Bitso ${API_KEY}:${nonce}:${signature}`,
  };

  try {
    const response = await fetch(`https://api.bitso.com${requestPath}`, {
      method,
      headers
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

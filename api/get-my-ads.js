// pages/api/get-my-ads.js
import crypto from 'crypto';

export default async function handler(req, res) {
  const API_KEY = process.env.BINANCE_API_KEY;
  const API_SECRET = process.env.BINANCE_API_SECRET;

  if (!API_KEY || !API_SECRET) {
    return res.status(500).json({ error: 'Faltan claves API' });
  }

  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', API_SECRET)
    .update(queryString)
    .digest('hex');

  const body = {
    page: 1,
    rows: 20
  };

  try {
    const result = await fetch(`https://p2p.binance.com/bapi/c2c/v2/private/c2c/adv/mine?${queryString}&signature=${signature}`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await result.json();
    console.log('📥 Respuesta de Binance:', JSON.stringify(data, null, 2)); // 👈 log

    if (!result.ok) {
      return res.status(result.status).json({ error: 'Error en la API de Binance', details: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}

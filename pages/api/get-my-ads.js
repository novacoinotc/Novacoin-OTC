// pages/api/get-my-ads.js
import crypto from 'crypto';

export default async function handler(req, res) {
  const API_KEY = process.env.BINANCE_API_KEY;
  const API_SECRET = process.env.BINANCE_API_SECRET;
  const TIMESTAMP = Date.now();

  const query = `timestamp=${TIMESTAMP}`;
  const signature = crypto.createHmac('sha256', API_SECRET).update(query).digest('hex');

  const body = {
    page: 1,
    rows: 10
  };

  try {
    const response = await fetch(`https://p2p.binance.com/bapi/c2c/v2/private/c2c/adv/mine?${query}&signature=${signature}`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error en la API de Binance', details: data });
    }

    return res.status(200).json(data.data || []);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los anuncios', details: error.message });
  }
}

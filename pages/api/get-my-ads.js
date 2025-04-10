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
  const signature = crypto.createHmac('sha256', API_SECRET).update(queryString).digest('hex');

  try {
    const result = await fetch(`https://p2p.binance.com/bapi/c2c/v2/private/c2c/adv/mine?${queryString}&signature=${signature}`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page: 1, rows: 10 }),
    });

    const data = await result.json();

    if (!result.ok) {
      return res.status(result.status).json({ error: 'Binance API error', details: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Error de servidor', details: error.message });
  }
}

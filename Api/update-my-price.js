import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { adId, price } = req.body;
  const API_KEY = process.env.BINANCE_API_KEY;
  const API_SECRET = process.env.BINANCE_API_SECRET;
  const TIMESTAMP = Date.now();
  const query = `advertisementId=${adId}&price=${price}&timestamp=${TIMESTAMP}`;
  const signature = crypto.createHmac('sha256', API_SECRET).update(query).digest('hex');

  try {
    const response = await fetch(`https://api.binance.com/sapi/v1/c2c/ads/updatePrice?${query}&signature=${signature}`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (response.ok) {
      res.status(200).json(data);
    } else {
      res.status(response.status).json({ error: data });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar precio', details: error.message });
  }
}

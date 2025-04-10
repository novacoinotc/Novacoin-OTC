import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { advNo, price } = req.body;
  const API_KEY = process.env.BINANCE_API_KEY;
  const API_SECRET = process.env.BINANCE_API_SECRET;
  const timestamp = Date.now();

  const payload = {
    advNo,
    price: Number(price),
    updateMode: 'selective'
  };

  const queryString = `timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', API_SECRET)
    .update(queryString)
    .digest('hex');

  try {
    const result = await fetch(`https://api.binance.com/sapi/v1/c2c/ads/update?${queryString}&signature=${signature}`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': API_KEY,
        'clientType': 'WEB',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await result.json();
    res.status(result.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el anuncio', details: error.message });
  }
}

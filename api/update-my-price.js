import crypto from 'crypto';

export default async function handler(req, res) {
  const API_KEY = process.env.BINANCE_API_KEY;
  const API_SECRET = process.env.BINANCE_API_SECRET;

  const { adId, price } = req.body;

  if (!API_KEY || !API_SECRET || !adId || !price) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  const timestamp = Date.now();
  const body = JSON.stringify({ advId: adId, price });
  const signature = crypto.createHmac('sha256', API_SECRET).update(body).digest('hex');

  try {
    const result = await fetch(`https://p2p.binance.com/bapi/c2c/v2/private/c2c/adv/update`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': API_KEY,
        'Content-Type': 'application/json',
        'X-SIGNATURE': signature
      },
      body
    });

    const data = await result.json();
    res.status(result.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar precio', details: error.message });
  }
}

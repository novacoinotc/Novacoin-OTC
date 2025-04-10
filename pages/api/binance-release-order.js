import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { orderNumber } = req.body;

  const API_KEY = process.env.BINANCE_API_KEY;
  const API_SECRET = process.env.BINANCE_SECRET;

  const timestamp = Date.now();
  const query = `orderNumber=${orderNumber}&timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', API_SECRET).update(query).digest('hex');

  try {
    const response = await fetch(`https://api.binance.com/sapi/v1/p2p/order/release?${query}&signature=${signature}`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    res.status(response.ok ? 200 : 400).json(data);
  } catch (error) {
    console.error('Error liberando orden:', error);
    res.status(500).json({ error: 'Fallo al liberar orden' });
  }
}

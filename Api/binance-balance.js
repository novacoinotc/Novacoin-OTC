import crypto from 'crypto';

export default async function handler(req, res) {
  const API_KEY = process.env.BINANCE_API_KEY;
  const API_SECRET = process.env.BINANCE_API_SECRET;

  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(queryString)
    .digest('hex');

  try {
    const response = await fetch(`https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': API_KEY
      }
    });

    const data = await response.json();

    if (data.balances) {
      res.status(200).json(data.balances);
    } else {
      res.status(500).json({ error: 'No se pudo obtener el balance', data });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al conectar con Binance', details: err });
  }
}

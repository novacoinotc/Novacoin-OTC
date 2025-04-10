import crypto from 'crypto';

export default async function handler(req, res) {
  const API_KEY = process.env.BINANCE_API_KEY;
  const API_SECRET = process.env.BINANCE_API_SECRET;

  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', API_SECRET).update(queryString).digest('hex');

  const body = {
    page: 1,
    rows: 10,
    tradeType: 'SELL',
    asset: 'USDT',
    fiatUnit: 'MXN'
  };

  try {
    const response = await fetch(`https://api.binance.com/sapi/v1/c2c/ads/listWithPagination?${queryString}&signature=${signature}`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': API_KEY,
        'clientType': 'WEB',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los anuncios', details: error.message });
  }
}

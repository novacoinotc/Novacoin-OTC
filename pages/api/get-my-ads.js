import crypto from 'crypto';

export default async function handler(req, res) {
  const API_KEY = process.env.BINANCE_API_KEY;
  const API_SECRET = process.env.BINANCE_API_SECRET;

  const timestamp = Date.now();
  const query = `timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', API_SECRET).update(query).digest('hex');

  try {
    const response = await fetch(`https://api.binance.com/sapi/v1/c2c/ads/list?${query}&signature=${signature}`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        page: 1,
        rows: 10
      })
    });

    const data = await response.json();

    // 🔍 Log completo para depurar
    console.log("🔍 Binance API response:", JSON.stringify(data, null, 2));

    if (response.ok && data && data.data && Array.isArray(data.data)) {
      res.status(200).json(data);
    } else {
      res.status(200).json({ data: [], warning: 'No se encontraron anuncios válidos.', raw: data });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los anuncios', details: error.message });
  }
}

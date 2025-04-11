// pages/api/update-my-price.js
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const API_KEY = process.env.BINANCE_API_KEY;
  const API_SECRET = process.env.BINANCE_API_SECRET;

  if (!API_KEY || !API_SECRET) {
    return res.status(500).json({ error: 'Faltan claves API' });
  }

  const { adId, price } = req.body;

  if (!adId || !price) {
    return res.status(400).json({ error: 'Faltan parámetros: adId o price' });
  }

  const timestamp = Date.now();
  const recvWindow = 5000;
  const queryString = `timestamp=${timestamp}&recvWindow=${recvWindow}`;
  const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(queryString)
    .digest('hex');

  const binanceUrl = `https://api.binance.com/sapi/v1/c2c/ads/updatePrice?${queryString}&signature=${signature}`;

  try {
    const proxyResponse = await fetch('https://binance-p2p-proxy.fly.dev/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: binanceUrl,
        method: 'POST',
        headers: {
          'X-MBX-APIKEY': API_KEY,
          'Content-Type': 'application/json'
        },
        data: {
          advNo: adId,
          price: price.toString()
        }
      })
    });

    const result = await proxyResponse.json();

    if (!proxyResponse.ok) {
      console.error('❌ Error al actualizar precio (proxy):', result);
      return res.status(proxyResponse.status).json({ error: 'Error desde Binance', details: result });
    }

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('❌ Error interno (proxy):', error);
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}

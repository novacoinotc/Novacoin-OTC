import crypto from 'crypto';

export default async function handler(req, res) {
  const API_KEY = process.env.BINANCE_API_KEY;
  const API_SECRET = process.env.BINANCE_API_SECRET;

  if (!API_KEY || !API_SECRET) {
    return res.status(500).json({ error: 'Faltan claves API' });
  }

  const timestamp = Date.now();
  const recvWindow = 5000;
  const queryString = `recvWindow=${recvWindow}&timestamp=${timestamp}`;

  const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(queryString)
    .digest('hex');

  const binanceUrl = `https://api.binance.com/sapi/v1/c2c/ads/mine?${queryString}&signature=${signature}`;

  try {
    const proxyResponse = await fetch('https://binance-p2p-proxy.onrender.com/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: binanceUrl,
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': API_KEY
        }
      })
    });

    const data = await proxyResponse.json();

    if (!proxyResponse.ok) {
      console.error('❌ Respuesta de Binance (a través del proxy):', data);
      return res.status(proxyResponse.status).json({ error: 'Error desde Binance', details: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Error al conectar con el proxy:', error);
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}

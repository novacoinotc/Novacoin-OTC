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

  const finalUrl = `https://api.binance.com/sapi/v1/c2c/ads/mine?${queryString}&signature=${signature}`;

  try {
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': API_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Respuesta de Binance:', data);
      return res.status(response.status).json({ error: 'Error desde Binance', details: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Error al conectar con Binance:', error);
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}

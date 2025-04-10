import crypto from 'crypto';

export default async function handler(req, res) {
  const API_KEY = process.env.BINANCE_API_KEY;
  const API_SECRET = process.env.BINANCE_API_SECRET;

  if (!API_KEY || !API_SECRET) {
    return res.status(500).json({ error: 'Faltan claves API' });
  }

  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', API_SECRET)
    .update(queryString)
    .digest('hex');

  try {
    const body = {
      page: 1,
      rows: 10
    };

    const response = await fetch(`https://p2p.binance.com/bapi/c2c/v2/private/c2c/adv/mine?${queryString}&signature=${signature}`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    console.log('🔍 Binance API response:', data); // <--- AÑADE ESTA LÍNEA

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error en Binance', details: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ ERROR al obtener anuncios Binance:', error); // <--- AÑADE ESTA LÍNEA
    return res.status(500).json({ error: 'Error interno', details: error.message });
  }
}

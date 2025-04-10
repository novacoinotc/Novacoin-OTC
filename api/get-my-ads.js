import crypto from 'crypto';

export default async function handler(req, res) {
  const API_KEY = process.env.BINANCE_API_KEY;
  const API_SECRET = process.env.BINANCE_API_SECRET;

  if (!API_KEY || !API_SECRET) {
    return res.status(500).json({ error: 'Faltan claves API' });
  }

  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', API_SECRET).update(queryString).digest('hex');

  const body = {
    page: 1,
    rows: 10
  };

  try {
    const response = await fetch(`https://p2p.binance.com/bapi/c2c/v2/private/c2c/adv/mine?${queryString}&signature=${signature}`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Respuesta de Binance:', data);
      return res.status(response.status).json({ error: 'Error desde Binance', details: data });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('❌ Error en servidor:', error.message);
    res.status(500).json({ error: 'Error al obtener los anuncios', details: error.message });
  }
}

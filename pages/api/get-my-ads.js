// pages/api/get-my-ads.js
import crypto from 'crypto';

export default async function handler(req, res) {
  const API_KEY = process.env.BINANCE_API_KEY;
  const API_SECRET = process.env.BINANCE_API_SECRET;

  if (!API_KEY || !API_SECRET) {
    console.error('❌ API_KEY o API_SECRET no definidos');
    return res.status(500).json({ error: 'Faltan claves API' });
  }

  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', API_SECRET).update(queryString).digest('hex');

  const requestBody = {
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
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    console.log('📥 Respuesta completa de Binance:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ Error al llamar a Binance:', response.status, data);
      return res.status(response.status).json({ error: 'Error en Binance', details: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}

// Archivo: /api/bitso-buy-usdt.js
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const API_KEY = 'TU_API_KEY';
  const API_SECRET = 'TU_API_SECRET';

  const nonce = Date.now().toString();
  const method = 'POST';
  const requestPath = '/v3/orders/';

  // 🛒 Parámetros de orden de compra USDT/MXN
  const orderBody = {
    book: 'usdt_mxn',
    side: 'buy',
    type: 'market',
    major: '50' // 👈 Monto en USDT (ajústalo como desees)
  };

  const jsonBody = JSON.stringify(orderBody);
  const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(nonce + method + requestPath + jsonBody)
    .digest('hex');

  try {
    const response = await fetch(`https://api.bitso.com${requestPath}`, {
      method,
      headers: {
        'Authorization': `Bitso ${API_KEY}:${nonce}:${signature}`,
        'Content-Type': 'application/json'
      },
      body: jsonBody
    });

    const data = await response.json();

    if (data.success) {
      res.status(200).json({ success: true, order: data.payload });
    } else {
      res.status(500).json({ success: false, error: data.error?.message || 'Error desconocido' });
    }
  } catch (error) {
    console.error('❌ Error en compra:', error);
    res.status(500).json({ success: false, error: 'Error en el servidor' });
  }
}

// archivo: /pages/api/update-ad-price.js
import crypto from 'crypto';

export default async function handler(req, res) {
  const { adId, price } = JSON.parse(req.body);
  const API_KEY = process.env.BINANCE_API_KEY;
  const API_SECRET = process.env.BINANCE_API_SECRET;
  const TIMESTAMP = Date.now();

  const query = `adId=${adId}&price=${price}&timestamp=${TIMESTAMP}`;
  const signature = crypto.createHmac('sha256', API_SECRET).update(query).digest('hex');

  const result = await fetch(`https://api.binance.com/sapi/v1/p2p/ad/updatePrice?${query}&signature=${signature}`, {
    method: 'POST',
    headers: {
      'X-MBX-APIKEY': API_KEY,
      'Content-Type': 'application/json'
    }
  });

  const data = await result.json();
  if (result.ok) {
    res.status(200).json({ success: true });
  } else {
    res.status(500).json({ error: data });
  }
}

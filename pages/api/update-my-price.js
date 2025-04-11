export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { adId, price } = req.body;

  if (!adId || !price) {
    return res.status(400).json({ error: 'Faltan parámetros: adId o price' });
  }

  try {
    // Redirigir la petición al servidor proxy en Render
    const proxyResponse = await fetch('https://binance-p2p-proxy.onrender.com/update-price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ adId, price })
    });

    const data = await proxyResponse.json();

    if (!proxyResponse.ok) {
      return res.status(proxyResponse.status).json({ error: 'Error desde el proxy', details: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Error al comunicar con el proxy:', error);
    return res.status(500).json({ error: 'Error al conectar con el proxy', details: error.message });
  }
}

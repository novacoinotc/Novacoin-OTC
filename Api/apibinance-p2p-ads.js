export default async function handler(req, res) {
  const body = {
    page: 1,
    rows: 10,
    payTypes: [],
    asset: 'USDT',
    tradeType: 'BUY',
    fiat: 'MXN'
  };

  try {
    const response = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    res.status(200).json(data.data); // Devuelve solo la lista de anuncios
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener anuncios P2P', details: err });
  }
}

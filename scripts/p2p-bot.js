// archivo: /scripts/p2p-bot.js
import fetch from 'node-fetch';

const BINANCE_API_KEY = process.env.BINANCE_API_KEY;
const BINANCE_API_SECRET = process.env.BINANCE_API_SECRET;

const YOUR_AD_ID = 'TU_ID_DE_ANUNCIO'; // remplaza con tu anuncio
const MARGEN = 0.01; // diferencia mínima vs el más barato

const getPublicLowestPrice = async (asset, fiat, tradeType) => {
  const res = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      asset,
      fiat,
      tradeType,
      page: 1,
      rows: 1
    })
  });
  const data = await res.json();
  return parseFloat(data.data[0].adv.price);
};

const updateMyAdPrice = async (adId, newPrice) => {
  // Aquí usarías tu backend privado que firme la solicitud con tus keys
  const res = await fetch('/api/update-ad-price', {
    method: 'POST',
    body: JSON.stringify({ adId, price: newPrice }),
    headers: { 'Content-Type': 'application/json' }
  });
  return res.ok;
};

export const runPriceBot = async () => {
  const lowest = await getPublicLowestPrice('USDT', 'MXN', 'SELL');
  const myNewPrice = (lowest - MARGEN).toFixed(2);
  const success = await updateMyAdPrice(YOUR_AD_ID, myNewPrice);
  console.log(success ? `✅ Precio actualizado: $${myNewPrice}` : '❌ Error actualizando precio');
};
